import { ethers } from 'ethers';
import { Logger } from 'pino';

import { ChainConfig, Network, getChainConfig } from '../const';
import { DepositRepo, HeadRepo, ProposalRepo, SignaturePassRepo, SubmitSignatureRepo } from '../repo';
import { sleep } from '../utils';

export abstract class CMD {
  public log: Logger;
  public name = '';
  protected shutdown = false;

  // provider
  protected network: Network;
  protected config: ChainConfig;
  protected provider: ethers.providers.JsonRpcProvider;

  // used for throttling
  protected rpcTimestamps = [];

  // repos
  protected headRepo = new HeadRepo();
  protected submitSignatureRepo = new SubmitSignatureRepo();
  protected signaturePassRepo = new SignaturePassRepo();
  protected depositRepo = new DepositRepo();
  protected proposalRepo = new ProposalRepo();

  abstract start();

  constructor(rootLogger: Logger, name: string, network) {
    this.name = name;
    if (rootLogger) {
      this.log = rootLogger.child({ cmd: this.name });
    }
    this.network = network;
    this.config = getChainConfig(network);
    this.provider = new ethers.providers.JsonRpcProvider(this.config.rpcUrl);
  }

  protected async throttle() {
    const now = new Date().getTime();
    if (this.rpcTimestamps.length === this.config.throttleCount) {
      this.rpcTimestamps.shift();
      const elapse = now - this.rpcTimestamps[0];
      if (elapse < this.config.throttleInterval) {
        this.log.info({ interval: this.config.throttleInterval - elapse }, 'sleep due to throttling');
        await sleep(this.config.throttleInterval - elapse);
      }
    }
    this.rpcTimestamps.push(new Date().getTime());
  }
}
