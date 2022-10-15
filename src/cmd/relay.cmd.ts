import { BigNumber } from 'bignumber.js';
import { _toEscapedUtf8String, mnemonicToEntropy } from 'ethers/lib/utils';
import { Logger } from 'pino';

import { Network, relayConfig } from '../const';
import { SignaturePass, SubmitSignature } from '../model';
import { Signatures, Signatures__factory } from '../typechain';
import { InterruptedError, calcEnd, sleep } from '../utils';
import { CMD } from './cmd';

const MIN_SYNC_WINDOW_SIZE = 5;
const FAST_INTERVAL = 3000;

export class RelayCMD extends CMD {
  private sig: Signatures;
  private relayKey = 'relay';

  constructor(rootLogger: Logger) {
    super(rootLogger, 'relay', Network.meter);
  }

  public async start() {
    this.log.info(`${this.name}: start`);
    this.sig = Signatures__factory.connect(relayConfig.sigAddress, this.provider);

    await this.init();
    await this.loop();
  }

  private async init() {
    const head = await this.headRepo.findByKey(this.relayKey);
    const headNum = head ? head.num + 1 : 0;

    // jumpstart if needed
    if (headNum < relayConfig.startBlockNum) {
      this.log.info(`Jump start relay to ${relayConfig.startBlockNum} on ${Network[this.config.network]}`);
      await this.headRepo.upsert(this.relayKey, relayConfig.startBlockNum);
    }
  }

  private async loop() {
    for (;;) {
      try {
        if (this.shutdown) {
          throw new InterruptedError();
        }

        const head = await this.headRepo.findByKey(this.relayKey);
        const headNum = head.num + 1;

        const bestNum = await this.provider.getBlockNumber();

        if (bestNum - headNum > MIN_SYNC_WINDOW_SIZE) {
          const tailNum = calcEnd(head, bestNum, this.config.windowSize);

          await this.fetchSubmitSignature(headNum, tailNum);
          await this.fetchSignaturePass(headNum, tailNum);

          await this.headRepo.upsert(this.relayKey, tailNum);
        }

        await sleep(FAST_INTERVAL);
      } catch (e) {
        if (!(e instanceof InterruptedError)) {
          this.log.error(e, this.name + 'loop: ' + (e as Error).stack);
        } else {
          if (this.shutdown) {
            break;
          }
        }
      }
    }
  }

  public async fetchSubmitSignature(startNum: string | number, endNum: string | number) {
    const event = this.sig.filters.SubmitSignature(null, null, null, null, null, null);
    const records = await this.sig.queryFilter(event, startNum, endNum);
    this.log.info(`filter SubmitSignature in block [${startNum}, ${endNum}] on ${Network[this.config.network]}`);

    if (records.length > 0) {
      this.log.info(`found ${records.length} SubmitSignature`);
    }

    for (const [i, e] of records.entries()) {
      if (this.shutdown) {
        break;
      }
      if (!e.args) {
        this.log.error(e, 'Error parsing proposal event');
        continue;
      }

      const key = {
        home: e.args.originDomainID,
        dest: e.args.destinationDomainID,
        nonce: new BigNumber(e.args.depositNonce.toString()).toNumber(),
      };
      const id = { key, txHash: e.transactionHash };

      const exist = await this.submitSignatureRepo.exists(key, e.transactionHash);
      if (exist) {
        this.log.info(id, `skip SubmitSignature, existed #${i + 1}/${records.length}`);
        continue;
      }

      const tx = await e.getTransaction();

      const newSubmitSignature = {
        key,
        resourceId: e.args.resourceID,
        data: e.args.data,
        signature: e.args.signature,

        relayerAddr: tx.from.toLowerCase(),
        txHash: e.transactionHash,
        blockNum: e.blockNumber,
      } as SubmitSignature;

      await this.submitSignatureRepo.create(newSubmitSignature);
      this.log.info(id, `SubmitSignature saved.`);
    }
  }

  public async fetchSignaturePass(startNum: string | number, endNum: string | number) {
    const event = this.sig.filters.SignaturePass(null, null, null, null, null, null);
    const records = await this.sig.queryFilter(event, startNum, endNum);
    this.log.info(`filter SignaturePass in [${startNum}, ${endNum}] on ${Network[this.config.network]}`);
    if (records.length > 0) {
      this.log.info(`found ${records.length} SignaturePass`);
    }

    for (const [i, e] of records.entries()) {
      if (this.shutdown) {
        break;
      }

      if (!e.args) {
        this.log.error(e, 'Error parsing event');
        continue;
      }

      const key = {
        home: e.args.originDomainID,
        dest: e.args.destinationDomainID,
        nonce: new BigNumber(e.args.depositNonce.toString()).toNumber(),
      };
      const id = { key, txHash: e.transactionHash };

      const exist = await this.signaturePassRepo.findByID(key, e.transactionHash);
      if (exist) {
        console.log(id, `skip current SignaturePass, existed #${i + 1}/${records.length}`);
        continue;
      }

      const tx = await e.getTransaction();

      const newSignaturePass = {
        key,
        resourceId: e.args.resourceID,
        data: e.args.data,
        signature: e.args.signature,

        relayerAddr: tx.from.toLowerCase(),
        txHash: e.transactionHash,
        blockNum: e.blockNumber,
      } as SignaturePass;

      await this.signaturePassRepo.create(newSignaturePass);
      this.log.info(newSignaturePass, `SignaturePass saved.`);
    }
  }
}
