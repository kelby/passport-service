import { BigNumber } from 'bignumber.js';
import { Logger } from 'pino';

import { Network, ProposalStatus } from '../const';
import { Deposit, Proposal } from '../model';
import { Bridge, Bridge__factory } from '../typechain';
import { InterruptedError, decodeCalldata, sleep } from '../utils';
import { CMD } from './cmd';

const LAZY_SYNC_INTERVAL = 5000;
const FAST_SYNC_INTERVAL = 500;

export class SyncCMD extends CMD {
  private bridge: Bridge;
  private depositKey = '';
  private proposalKey = '';
  private targetKey = '';

  private dormentInterval = 0;

  constructor(network: Network, rootLogger: Logger) {
    super(rootLogger, 'sync', network);
    this.depositKey = `${this.network}_deposit`.toLowerCase();
    this.proposalKey = `${this.network}_proposal`.toLowerCase();
    this.targetKey = `${this.network}_target`.toLowerCase();
  }

  public async start() {
    this.log.info(`${this.name}: start`);
    this.dormentInterval = this.config.avgBlockTime * this.config.windowSize * 1000;
    this.bridge = Bridge__factory.connect(this.config.bridgeAddress, this.provider);

    await this.init();
    await this.loop();
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
      this.log.info(`Jump start deposit sync to ${this.config.startBlockNum} on ${Network[this.config.network]}`);
      await this.headRepo.upsert(this.depositKey, this.config.startBlockNum);
    }
    if (phead < this.config.startBlockNum) {
      this.log.info(`Jump start proposal sync to ${this.config.startBlockNum} on ${Network[this.config.network]}`);
      await this.headRepo.upsert(this.proposalKey, this.config.startBlockNum);
    }
    if (!targetHead || targetHead.num <= 0) {
      this.log.info(`Set target head with current best num: ${bestNum}`);
      await this.headRepo.upsert(this.targetKey, bestNum);
    }
  }

  private async loop() {
    let dormentAt = 0;
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
          this.log.info(targetHead, 'target head update detected');
          await this.throttle();
          targetNum = await this.provider.getBlockNumber();
          await this.headRepo.upsert(this.targetKey, targetNum);
        }

        // if head > target, enter dorment mode
        if (dhead >= targetNum && phead >= targetNum) {
          if (dormentAt === 0) {
            dormentAt = new Date().getTime();
            this.log.info({ targetNum, phead, dhead }, `dorment sync on ${Network[this.config.network]}`);
            continue;
          }
        }

        // wake up from dorment
        if (dormentAt > 0 && now - dormentAt >= this.dormentInterval) {
          this.log.info({ dormentAt, dormented: now - dormentAt }, 'wake up from dorment');
          await this.throttle();
          targetNum = await this.provider.getBlockNumber();
          await this.headRepo.upsert(this.targetKey, targetNum);
          dormentAt = 0;
        }

        if (dhead < targetNum) {
          const dtail = this.calcEnd(dhead, targetNum, this.config.windowSize);
          try {
            await this.fetchDeposits(dhead, dtail);
            await this.headRepo.upsert(this.depositKey, dtail);
          } catch (e) {
            if (e instanceof InterruptedError) {
              throw e;
            } else {
              this.log.error('deposit scan error:', e);
            }
          }
        }

        if (phead < targetNum) {
          const ptail = this.calcEnd(phead, targetNum, this.config.windowSize);
          try {
            await this.fetchProposals(phead, ptail);
            await this.headRepo.upsert(this.proposalKey, ptail);
          } catch (e) {
            if (e instanceof InterruptedError) {
              throw e;
            } else {
              this.log.error('proposal scan error:', e);
            }
          }
        } else {
        }

        if (dormentAt > 0) {
          await sleep(Number(LAZY_SYNC_INTERVAL));
        } else {
          await sleep(Number(FAST_SYNC_INTERVAL));
        }
      } catch (e) {
        if (e instanceof InterruptedError) {
          if (this.shutdown) {
            break;
          }
        } else {
          this.log.error(e, this.name + 'loop: ' + (e as Error).stack);
        }
      }
    }
  }

  public async fetchProposals(startNum: string | number, endNum: string | number) {
    const event = this.bridge.filters.ProposalEvent(null, null, null, null);

    this.log.info(`filter ProposalEvent in [${startNum},${endNum}] on ${Network[this.config.network]}`);
    await this.throttle();
    const proposals = await this.bridge.queryFilter(event, startNum, endNum);
    if (proposals.length > 0) {
      this.log.info(`found ${proposals.length} ProposalEvent`);
    }

    for (const [i, p] of proposals.entries()) {
      if (this.shutdown) {
        break;
      }
      if (!p.args) {
        this.log.error(p, 'Error parsing proposal event');
        continue;
      }

      const key = {
        home: p.args.originDomainId,
        dest: this.config.domainId,
        nonce: new BigNumber(p.args.depositNonce.toString()).toNumber(),
      };

      this.log.info(key, `start to process ProposalEvent`);

      const proposal = await this.proposalRepo.findByKey(key);

      if (proposal) {
        if (proposal.lastUpdateBlockNum < p.blockNumber || proposal.status != p.args.status) {
          // avoid handling existing tx
          proposal.status = Number(p.args.status) as ProposalStatus;
          proposal.lastUpdateBlockNum = p.blockNumber;
          for (const txHash of proposal.txHashs) {
            if (txHash === p.transactionHash) {
              continue;
            }
          }
          proposal.txHashs.push(p.transactionHash);
          await proposal.save();
          this.log.info(key, `update status to ${ProposalStatus[proposal.status]}`);
        }
        continue;
      }

      const newProposal = {
        key,

        resourceId: p.args.resourceID,
        dataHash: p.args.dataHash,
        status: p.args.status as ProposalStatus,

        txHashs: [p.transactionHash],
        createBlockNum: p.blockNumber,
        lastUpdateBlockNum: p.blockNumber,
      } as Proposal;

      await this.proposalRepo.create(newProposal);
      this.log.info(newProposal, `Proposal saved.`);
      await this.headRepo.upsert(this.proposalKey, p.blockNumber);
    }
  }

  public async fetchDeposits(startNum: string | number, endNum: string | number) {
    const event = this.bridge.filters.Deposit(null, null, null, null, null, null);

    this.log.info(`filter Deposit in [${startNum}, ${endNum}] on ${Network[this.config.network]}`);
    await this.throttle();
    const deposits = await this.bridge.queryFilter(event, startNum, endNum);
    if (deposits.length > 0) {
      this.log.info(`found ${deposits.length} Deposits`);
    }

    for (const [i, d] of deposits.entries()) {
      if (this.shutdown) {
        break;
      }

      if (!d.args) {
        this.log.error(d, 'Error parsing deposit event');
        continue;
      }
      const key = {
        home: this.config.domainId,
        dest: d.args.destinationDomainID,
        nonce: new BigNumber(d.args.depositNonce.toString()).toNumber(),
      };

      const exist = await this.depositRepo.exists(key);
      if (exist) {
        console.log(`skip current Deposit, existed # ${i + 1}/${deposits.length}`);
        continue;
      }

      this.log.info(key, `start to process Deposit, # ${i + 1}/${deposits.length}`);

      // FIXME: may have different format
      const decoded = decodeCalldata(d.args.data);
      if (!decoded) {
        continue;
      }
      this.log.info(decoded, `Decoded Deposit info`);

      const newDeposit = {
        key,

        resourceId: d.args.resourceID,
        data: d.args.data,

        // address
        fromAddr: d.args.user.toLowerCase(),
        toAddr: decoded.toAddr.toLowerCase(),
        amount: new BigNumber(decoded.amount.toString()),

        // tx detail
        txHash: d.transactionHash,
        blockNum: Number(d.blockNumber),
      } as Deposit;

      await this.depositRepo.create(newDeposit);
      this.log.info(newDeposit, `Deposit saved.`);

      await this.headRepo.upsert(this.depositKey, d.blockNumber);
    }
  }
}
