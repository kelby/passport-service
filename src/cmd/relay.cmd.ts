import { EventEmitter } from 'events';

import * as Logger from 'bunyan';
import { ethers, utils } from 'ethers';
import { _toEscapedUtf8String } from 'ethers/lib/utils';

import { Network, RelayConfig, getChainConfig, relayConfig } from '../const';
import { HeadRepo } from '../repo';
import { Signatures, Signatures__factory } from '../typechain';
import { InterruptedError, sleep } from '../utils';
import { CMD } from './cmd';

const MIN_SYNC_WINDOW_SIZE = 5;
const FAST_INTERVAL = 3000;

export class RelayCMD extends CMD {
  private shutdown = false;
  private ev = new EventEmitter();
  private name = 'relay';
  private logger = Logger.createLogger({ name: this.name });
  private network: Network;
  private config: RelayConfig;
  private provider: ethers.providers.JsonRpcProvider;
  private sig: Signatures;
  private relayKey = 'relay';
  private rpcTimestamps = [];
  private headRepo = new HeadRepo();

  constructor(network: Network) {
    super();
    this.network = network;
    delete this.logger.fields.hostname;
    delete this.logger.fields.pid;
  }

  public async start() {
    this.logger.info(`${this.name}: start`);
    this.config = relayConfig;
    this.provider = new ethers.providers.JsonRpcProvider(this.config.rpcUrl);
    // FIXME: change address to relay chain contract
    this.sig = Signatures__factory.connect(this.config.sigAddress, this.provider);

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
    const head = await this.headRepo.findByKey(this.relayKey);

    const headNum = head ? head.num + 1 : 0;

    // jumpstart if needed
    if (headNum < this.config.startBlockNum) {
      this.logger.info(`Jump start proposal sync to ${this.config.startBlockNum} on ${Network[this.config.network]}`);
      await this.headRepo.upsert(this.relayKey, this.config.startBlockNum);
    }
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

        const head = await this.headRepo.findByKey(this.relayKey);
        const headNum = head.num + 1;

        await this.throttle();
        const bestNum = await this.provider.getBlockNumber();

        if (bestNum - headNum > MIN_SYNC_WINDOW_SIZE) {
          const tailNum = this.calcEnd(head, bestNum, this.config.windowSize);
          await this.throttle();

          await this.fetchSubmitSignature(headNum, tailNum);
          await this.fetchSignaturePass(headNum, tailNum);

          await this.headRepo.upsert(this.relayKey, tailNum);
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

  public async fetchSubmitSignature(startNum: string | number, endNum: string | number) {
    // FIXME:
  }

  public async fetchSignaturePass(startNum: string | number, endNum: string | number) {
    // FIXME:
  }
}
