import { EventEmitter } from 'events';

import { BigNumber } from 'bignumber.js';
import * as Logger from 'bunyan';
import { ethers, utils } from 'ethers';

import { ChainConfig, Network, ProposalStatus, getChainConfig, getChainConfigByChainId } from '../const';
import { Deposit, Proposal } from '../model';
import { DepositRepo, HeadRepo, ProposalRepo } from '../repo';
import { Bridge, Bridge__factory } from '../typechain';
import { InterruptedError, decodeCalldata, sleep } from '../utils';
import { CMD } from './cmd';

const FAST_INTERVAL = 5000;

export class SyncCMD extends CMD {
  private shutdown = false;
  private ev = new EventEmitter();
  private name = 'sync';
  private logger = Logger.createLogger({ name: this.name });
  private network: Network;
  private config: ChainConfig;
  private provider: ethers.providers.JsonRpcProvider;
  private bridge: Bridge;
  private depositKey = '';
  private proposalKey = '';
  private targetKey = '';
  private rpcTimestamps = [];

  private depositRepo = new DepositRepo();
  private proposalRepo = new ProposalRepo();
  private headRepo = new HeadRepo();

  private dormentInterval = 0;

  constructor(network: Network) {
    super();
    this.network = network;
    this.depositKey = `${this.network}_deposit`.toLowerCase();
    this.proposalKey = `${this.network}_proposal`.toLowerCase();
    this.targetKey = `${this.network}_target`.toLowerCase();
    delete this.logger.fields.hostname;
    delete this.logger.fields.pid;
  }

  public async start() {
    this.logger.info(`${this.name}: start`);
    this.config = getChainConfig(this.network);
    this.dormentInterval = this.config.avgBlockTime * this.config.windowSize * 1000;
    this.provider = new ethers.providers.JsonRpcProvider(this.config.rpcUrl);
    this.bridge = Bridge__factory.connect(this.config.bridgeAddress, this.provider);

    await this.init();
    await this.loop();
  }

  private async throttle() {
    const now = new Date().getTime();
    if (this.rpcTimestamps.length === this.config.throttleCount) {
      this.rpcTimestamps.shift();
      const elapse = now - this.rpcTimestamps[0];
      if (elapse < this.config.throttleInterval) {
        this.logger.debug({ interval: this.config.throttleInterval - elapse }, 'sleep due to throttling');
        await sleep(this.config.throttleInterval - elapse);
      }
    }
    this.rpcTimestamps.push(new Date().getTime());
  }

  private calcEnd(start, end, step: number) {
    if (start > end) {
      return start;
    }
    const actualEnd = end > start + step ? start + step - 1 : end;
    return actualEnd;
  }

  private async init() {
    const depositHead = await this.headRepo.findByKey(this.depositKey);
    const proposalHead = await this.headRepo.findByKey(this.proposalKey);
    const targetHead = await this.headRepo.findByKey(this.targetKey);

    const dhead = depositHead ? depositHead.num + 1 : 0;
    const phead = proposalHead ? proposalHead.num + 1 : 0;

    await this.throttle();
    const bestNum = await this.provider.getBlockNumber();

    // jumpstart if needed
    if (dhead < this.config.startBlockNum) {
      this.logger.info(`Jump start deposit sync to ${this.config.startBlockNum} on ${Network[this.config.network]}`);
      await this.headRepo.upsert(this.depositKey, this.config.startBlockNum);
    }
    if (phead < this.config.startBlockNum) {
      this.logger.info(`Jump start proposal sync to ${this.config.startBlockNum} on ${Network[this.config.network]}`);
      await this.headRepo.upsert(this.proposalKey, this.config.startBlockNum);
    }
    if (!targetHead || targetHead.num <= 0) {
      this.logger.info(`Set target head with current best num: ${bestNum}`);
      await this.headRepo.upsert(this.targetKey, bestNum);
    }
  }

  private async loop() {
    let pDormentTime = 0;
    let dDormentTime = 0;
    for (;;) {
      try {
        if (this.shutdown) {
          throw new InterruptedError();
        }

        const depositHead = await this.headRepo.findByKey(this.depositKey);
        const proposalHead = await this.headRepo.findByKey(this.proposalKey);
        const targetHead = await this.headRepo.findByKey(this.targetKey);
        let targetNum = targetHead.num;

        const dhead = depositHead.num + 1;
        const phead = proposalHead.num + 1;
        const now = new Date().getTime();

        // target head updated, catch-up now
        if (!targetHead || targetHead.num <= 0) {
          this.logger.info(targetHead, 'target head update detected');
          await this.throttle();
          targetNum = await this.provider.getBlockNumber();
          await this.headRepo.upsert(this.targetKey, targetNum);
        }

        // wake up from dorment
        if (now - dDormentTime >= this.dormentInterval || now - pDormentTime >= this.dormentInterval) {
          this.logger.info({ dormented: now - dDormentTime, pDormented: now - pDormentTime }, 'wake up from dorment');
          await this.throttle();
          targetNum = await this.provider.getBlockNumber();
          await this.headRepo.upsert(this.targetKey, targetNum);

          dDormentTime = 0;
          pDormentTime = 0;
        }

        if (dhead < targetNum) {
          const dtail = this.calcEnd(dhead, targetNum, this.config.windowSize);
          await this.throttle();
          await this.fetchDeposits(dhead, dtail);
          await this.headRepo.upsert(this.depositKey, dtail);
        } else {
          if (dDormentTime === 0) {
            dDormentTime = new Date().getTime();
            this.logger.info({ targetNum, dhead }, 'dorment deposit sync');
          }
        }

        if (phead < targetNum) {
          const ptail = this.calcEnd(phead, targetNum, this.config.windowSize);
          await this.throttle();
          await this.fetchProposals(phead, ptail);
          await this.headRepo.upsert(this.proposalKey, ptail);
        } else {
          if (pDormentTime === 0) {
            pDormentTime = new Date().getTime();
          }
          this.logger.info({ targetNum, phead }, 'dorment proposal sync');
        }

        await sleep(Number(FAST_INTERVAL));
      } catch (e) {
        if (!(e instanceof InterruptedError)) {
          this.logger.error(e, this.name + 'loop: ' + (e as Error).stack);
        } else {
          if (this.shutdown) {
            this.ev.emit('closed');
            break;
          }
        }
      }
    }
  }

  public async fetchProposals(startNum: string | number, endNum: string | number) {
    const event = this.bridge.filters.ProposalEvent(null, null, null, null);

    this.logger.info(
      { from: startNum, to: endNum, len: Number(endNum) - Number(startNum) + 1, network: Network[this.config.network] },
      `Filter ProposalEvent`
    );
    const proposals = await this.bridge.queryFilter(event, startNum, endNum);
    if (proposals.length > 0) {
      this.logger.info(`Found ${proposals.length} ProposalEvent`);
    }

    for (const [i, p] of proposals.entries()) {
      if (this.shutdown) {
        break;
      }
      if (!p.args) {
        this.logger.error(p, 'Error parsing proposal event');
        continue;
      }

      const key = {
        home: p.args.originDomainId,
        dest: this.config.chainId,
        nonce: new BigNumber(p.args.depositNonce.toString()).toNumber(),
      };
      const existTx = await this.depositRepo.findByTx(p.transactionHash);
      if (existTx) {
        console.log(`skip current ProposalEvent, existed tx # ${i + 1}/${proposals.length}`);
        continue;
      }

      this.logger.info(key, `Start to process ProposalEvent`);

      const proposal = await this.proposalRepo.findByKey(key);

      if (proposal) {
        if (proposal.blockNum < p.blockNumber || proposal.status != p.args.status) {
          proposal.status = Number(p.args.status) as ProposalStatus;
          await proposal.save();
          this.logger.info(key, `Update status to ${ProposalStatus[proposal.status]}`);
        } else {
          this.logger.info(key, `skip proposal, existed`);
        }
        continue;
      }

      const decoded = decodeCalldata(p.args.data);
      if (!decoded) {
        continue;
      }

      const block = await p.getBlock();

      const newProposal = {
        network: this.config.network,
        key,

        resourceId: p.args.resourceID,
        dataHash: p.args.dataHash,
        status: p.args.status as ProposalStatus,

        txHash: p.transactionHash,
        blockNum: p.blockNumber,
        blockTimestamp: block.timestamp,

        toAddr: decoded.toAddr,
        amount: decoded.amount,
      } as Proposal;

      await this.proposalRepo.create(newProposal);
      this.logger.info(newProposal, `Proposal saved.`);
      await this.headRepo.upsert(this.proposalKey, p.blockNumber);
    }
  }

  public async fetchDeposits(startNum: string | number, endNum: string | number) {
    const event = this.bridge.filters.Deposit(null, null, null, null, null, null);

    this.logger.info(
      { from: startNum, to: endNum, len: Number(endNum) - Number(startNum) + 1, network: Network[this.config.network] },
      `Filter Deposit`
    );
    const deposits = await this.bridge.queryFilter(event, startNum, endNum);
    if (deposits.length > 0) {
      this.logger.info(`Found ${deposits.length} Deposits`);
    }

    for (const [i, d] of deposits.entries()) {
      if (this.shutdown) {
        break;
      }

      if (!d.args) {
        this.logger.error(d, 'Error parsing deposit event');
        continue;
      }
      const key = {
        home: this.config.chainId,
        dest: d.args.destinationChainID,
        nonce: new BigNumber(d.args.depositNonce.toString()).toNumber(),
      };
      const existTx = await this.depositRepo.existsTx(d.transactionHash);
      if (existTx) {
        console.log(`skip current Deposit, existed tx# ${i + 1}/${deposits.length}`);
        continue;
      }
      const exist = await this.depositRepo.exists(key);
      if (exist) {
        console.log(`skip current Deposit, existed # ${i + 1}/${deposits.length}`);
        continue;
      }

      this.logger.info(key, `start to process Deposit, # ${i + 1}/${deposits.length}`);

      const decoded = decodeCalldata(d.args.data);
      if (!decoded) {
        continue;
      }
      this.logger.info(decoded, `Decoded Deposit info`);

      const destConfig = getChainConfigByChainId(d.args.destinationDomainID);

      let dataHash = '0x';
      if (destConfig) {
        const records = await this.bridge._depositRecords(d.args.depositNonce, d.args.destinationDomainID);
        dataHash = ethers.utils.solidityKeccak256(['address', 'bytes'], [destConfig.erc20HandlerAddress, records]);
      } else {
        this.logger.warn(
          { destDomainId: d.args.destinationDomainID, blockNum: d.blockNumber },
          'No destination chain config found for deposit in block:'
        );
      }
      const block = await d.getBlock();

      const newDeposit = {
        network: this.config.network,
        key,

        resourceId: d.args?.resourceID,
        dataHash: dataHash,

        // address
        fromAddr: d.args.user.toLowerCase(),
        toAddr: decoded.toAddr.toLowerCase(),
        amount: new BigNumber(decoded.amount.toString()),

        // tx detail
        txHash: d.transactionHash,
        blockNum: Number(d.blockNumber),
        blockTimestamp: Number(block.timestamp),
      } as Deposit;

      await this.depositRepo.create(newDeposit);
      this.logger.info(newDeposit, `Deposit saved.`);

      await this.headRepo.upsert(this.depositKey, d.blockNumber);
    }
  }
}
