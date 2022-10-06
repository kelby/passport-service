import { EventEmitter } from 'events';

import { BigNumber } from 'bignumber.js';
import * as Logger from 'bunyan';
import { ethers, utils } from 'ethers';
import { _toEscapedUtf8String } from 'ethers/lib/utils';

import { Bridge, Bridge__factory } from '../bridgeTypes';
import { ChainConfig, Network, ProposalStatus, getChainConfig, getChainConfigByChainId } from '../const';
import { Proposal } from '../model/proposal.interface';
import { DepositRepo } from '../repo/deposit.repo';
import HeadRepo from '../repo/head.repo';
import { ProposalRepo } from '../repo/proposal.repo';
import { InterruptedError, sleep } from '../utils';
import { CMD } from './cmd';

const MIN_WINDOW_SIZE = 6;
const { FAST_INTERVAL, SLOW_INTERVAL } = process.env;

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
  private rpcTimestamps = [];

  private depositRepo = new DepositRepo();
  private proposalRepo = new ProposalRepo();
  private headRepo = new HeadRepo();

  constructor(network: Network) {
    super();
    this.network = network;
    this.depositKey = `${this.network}_deposit`.toLowerCase();
    this.proposalKey = `${this.network}_proposal`.toLowerCase();
    delete this.logger.fields.hostname;
    delete this.logger.fields.pid;
  }

  public async start() {
    this.logger.info(`${this.name}: start`);
    this.config = getChainConfig(this.network);
    this.provider = new ethers.providers.JsonRpcProvider(this.config.rpcUrl);
    this.bridge = Bridge__factory.connect(this.config.bridgeAddress, this.provider);

    await this.loop();
  }

  private async loop() {
    for (;;) {
      try {
        if (this.shutdown) {
          throw new InterruptedError();
        }

        if (this.shutdown) {
          throw new InterruptedError();
        }

        const depositHead = await this.headRepo.findByKey(this.depositKey);
        const proposalHead = await this.headRepo.findByKey(this.proposalKey);

        const dhead = depositHead ? depositHead.num + 1 : 0;
        const phead = proposalHead ? proposalHead.num + 1 : 0;

        const bestNum = await this.provider.getBlockNumber();

        // jumpstart if needed
        let jumpstart = false;
        if (dhead < this.config.startBlockNum) {
          await this.headRepo.upsert(this.depositKey, this.config.startBlockNum);
          jumpstart = true;
        }
        if (phead < this.config.startBlockNum) {
          await this.headRepo.upsert(this.proposalKey, this.config.startBlockNum);
          jumpstart = true;
        }
        if (jumpstart) {
          this.logger.info(`Jump start to ${this.config.startBlockNum} on ${Network[this.config.network]}`);
          continue;
        }

        const dStartNum = dhead;
        const dEndNum = bestNum > dStartNum + this.config.windowSize ? dStartNum + this.config.windowSize - 1 : bestNum;
        const pStartNum = phead;
        const pEndNum = bestNum > pStartNum + this.config.windowSize ? pStartNum + this.config.windowSize - 1 : bestNum;

        // sleep for rate limit
        const fastforward =
          bestNum > dStartNum + this.config.windowSize && bestNum > pStartNum + this.config.windowSize;

        this.logger.info(`Start to fetch on ${Network[this.config.network]}`);

        if (dEndNum - dStartNum > MIN_WINDOW_SIZE) {
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
          await this.fetchDeposits(dStartNum, dEndNum);
          await this.headRepo.upsert(this.depositKey, dEndNum);
        }

        if (bestNum - pStartNum > MIN_WINDOW_SIZE) {
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
          await this.fetchProposals(pStartNum, pEndNum);
          await this.headRepo.upsert(this.proposalKey, pEndNum);
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
    const event = this.bridge.filters.ProposalEvent();

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
        this.logger.error(p, 'Error during process proposal event');
        continue;
      }

      const id = {
        blockNum: p.blockNumber,
        homeChainId: p.args.originChainID,
        destChainId: this.config.chainId,
        nonce: new BigNumber(p.args.depositNonce.toString()).toNumber(),
      };
      const savedProposal = await this.depositRepo.findByTx(p.transactionHash);
      if (savedProposal) {
        console.log(`skip current ProposalEvent, existed # ${i + 1}/${proposals.length}`);
        continue;
      }

      this.logger.info(id, `Start to process ProposalEvent`);

      const proposal = await this.proposalRepo.findByTx(p.transactionHash);

      if (proposal) {
        if (proposal.blockNum < p.blockNumber || proposal.status != p.args.status) {
          proposal.status = Number(p.args.status) as ProposalStatus;
          await proposal.save();
          this.logger.info(id, `Update status to ${ProposalStatus[proposal.status]}`);
        } else {
          this.logger.info(id, `skip proposal, existed`);
        }
        continue;
      }

      const tx = await p.getTransaction();
      if (!tx || !tx.to) {
        this.logger.error(id, 'Could not get proposal tx');
        continue;
      }
      if (!tx.data.startsWith('0x4454b20d')) {
        console.log('this is not a executeProposal call');
        continue;
      }

      console.log('decode proposal for tx: ', tx);
      const decoded = this.decodeProposal(tx.data);
      if (!decoded) {
        continue;
      }

      const block = await p.getBlock();

      const newProposal = {
        network: this.config.network,
        homeChainId: p.args?.originChainID,
        destChainId: this.config.chainId,
        depositNonce: new BigNumber(p.args?.depositNonce.toString()).toNumber(),
        destBridgeAddr: this.config.bridgeAddress.toLocaleLowerCase(),

        resourceId: p.args?.resourceID,
        dataHash: p.args?.dataHash,

        status: p.args?.status,

        txHash: p.transactionHash,
        blockNum: p.blockNumber,
        blockTimestamp: block.timestamp,

        toAddr: decoded.toAddr,
        amount: decoded.amount,
      } as Proposal;
      const exist = await this.proposalRepo.exists(
        newProposal.homeChainId,
        newProposal.destChainId,
        newProposal.depositNonce,
        newProposal.destBridgeAddr
      );
      if (!exist) {
        await this.proposalRepo.create(newProposal);
        this.logger.info(newProposal, `Proposal saved.`);
      } else {
        this.logger.info(newProposal, `Proposal exists`);
      }
      await this.headRepo.upsert(this.proposalKey, p.blockNumber);
    }
  }

  public decodeDeposit(data) {
    const decoded = utils.defaultAbiCoder.decode(['uint8', 'bytes32', 'bytes'], utils.hexDataSlice(data, 4));
    const resourceID = decoded[1];
    console.log(`resourceID in Deposit: ${resourceID}`);

    let calldata = decoded[2].toString();
    const len = 2 + 32 * 3 * 2 - calldata.length;
    if (len < 0) {
      console.log(`Invalid len: `, len, 'skip now');
      return;
    }
    calldata = decoded[2] + '0'.repeat(len);
    const decodedData = utils.defaultAbiCoder.decode(['uint256', 'uint64', 'bytes32'], calldata);

    const toAddr = utils.hexDataSlice(decodedData[2], 0, decodedData[1].toNumber());
    const amount = new BigNumber(decodedData[0].toString());
    return { toAddr, amount, resourceID };
  }

  public decodeProposal(data) {
    const decoded = utils.defaultAbiCoder.decode(['uint8', 'uint64', 'bytes', 'bytes32'], utils.hexDataSlice(data, 4));
    const resourceID = decoded[3].toLowerCase();
    console.log('resourceID in Proposal: ', resourceID);
    let calldata = decoded[2];

    const len = 2 + 32 * 3 * 2 - calldata.length;
    if (len < 0) {
      console.log('Invalid len: ', len, 'skip now');
      return;
    }
    calldata = decoded[2] + '0'.repeat(len);
    const decodedData = utils.defaultAbiCoder.decode(['uint256', 'uint64', 'bytes32'], calldata);

    const toAddr = utils.hexDataSlice(decodedData[2], 0, decodedData[1].toNumber()).toLowerCase();
    const amount = new BigNumber(decodedData[0].toString());
    return { toAddr, amount, resourceID };
  }

  public async fetchDeposits(startNum: string | number, endNum: string | number) {
    const event = this.bridge.filters.Deposit();

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
        this.logger.error(d, 'Error during get args in deposit event');
        continue;
      }
      const did = {
        blockNum: d.blockNumber,
        homeChainId: this.config.chainId,
        destChainId: d.args.destinationChainID,
        depositNonce: new BigNumber(d.args.depositNonce.toString()).toFixed(0),
      };
      const savedDeposit = await this.depositRepo.findByTx(d.transactionHash);
      if (savedDeposit) {
        console.log(`skip current Deposit, existed # ${i + 1}/${deposits.length}`);
        continue;
      }

      this.logger.info(did, `start to process Deposit, # ${i + 1}/${deposits.length}`);

      const tx = await d.getTransaction();
      if (!tx || !tx.to) {
        this.logger.error(did, 'Could not get deposit tx');
        continue;
      }

      if (tx.to.toLowerCase() !== this.config.bridgeAddress.toLowerCase()) {
        this.logger.info(
          { txTo: tx.to.toLowerCase(), bridgeAddr: this.config.bridgeAddress.toLowerCase() },
          'tx.to doesnt match with bridgeAddr, skip ...'
        );
        continue;
      }
      const decoded = this.decodeDeposit(tx.data);
      if (!decoded) {
        continue;
      }
      this.logger.info(decoded, `Decoded Deposit info`);

      const destConfig = getChainConfigByChainId(d.args?.destinationChainID);

      let dataHash = '0x';
      if (destConfig) {
        const records = await this.bridge._depositRecords(d.args?.depositNonce, d.args?.destinationChainID);
        dataHash = ethers.utils.solidityKeccak256(['address', 'bytes'], [destConfig.erc20HandlerAddress, records]);
      } else {
        this.logger.warn(
          { destChainId: d.args?.destinationChainID, blockNum: d.blockNumber },
          'No destination chain config found for deposit in block:'
        );
      }
      const block = await d.getBlock();

      const newDeposit = {
        network: this.config.network,
        homeChainId: this.config.chainId,
        destChainId: d.args?.destinationChainID,
        depositNonce: new BigNumber(d.args?.depositNonce.toString()).toNumber(),
        homeBridgeAddr: this.config.bridgeAddress.toLowerCase(),

        resourceId: d.args?.resourceID,
        dataHash: dataHash,

        // address
        fromAddr: tx.from.toLowerCase(),
        toAddr: decoded.toAddr.toLowerCase(),
        amount: new BigNumber(decoded.amount.toString()),

        // tx detail
        txHash: d.transactionHash,
        blockNum: Number(d.blockNumber),
        blockTimestamp: Number(block.timestamp),
      };
      const exist = await this.depositRepo.exists(
        newDeposit.homeChainId,
        newDeposit.destChainId,
        newDeposit.depositNonce,
        newDeposit.homeBridgeAddr
      );
      if (!exist) {
        await this.depositRepo.create(newDeposit);
        this.logger.info(newDeposit, `Deposit saved.`);
      } else {
        this.logger.info(`Deposit exists`);
      }
      await this.headRepo.upsert(this.depositKey, d.blockNumber);
    }
  }

  public stop() {
    this.shutdown = true;

    return new Promise((resolve) => {
      this.logger.info('shutting down......');
      this.ev.on('closed', resolve);
    });
  }
}
