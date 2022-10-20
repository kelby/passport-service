import { Request, Response } from 'express';
import { Logger } from 'pino';

import { Network, ProposalStatus, chainConfigs } from '../../const';
import { try$ } from '../interfaces/controller.interface';
import { BaseController } from './base.controller';

export class StatController extends BaseController {
  constructor(rootLogger: Logger) {
    super(rootLogger, 'stat', '/api/stat');
    this.router.get(`${this.path}/`, try$(this.getStat));
  }

  private getStat = async (req: Request, res: Response) => {
    let result = {};
    for (const fromChain of chainConfigs) {
      const home = fromChain.domainId;
      for (const toChain of chainConfigs) {
        const dest = toChain.domainId;
        if (home == dest) {
          continue;
        }

        const deposits = await this.depositRepo.findByHomeAndDest(home, dest);
        const proposals = await this.proposalRepo.findByHomeAndDest(home, dest);
        let danglingProposals = [];
        let danglingDeposits = [];
        this.log.info({ home, dest, deposits: deposits.length, proposals: proposals.length }, 'counted on network');
        if (deposits.length > 0 || proposals.length > 0) {
          let dmap = {};
          let pmap = {};
          deposits.map((d) => dmap[`${d.key.home}-${d.key.dest}-${d.key.nonce}`]);
          proposals.map((p) => pmap[`${p.key.home}-${p.key.dest}-${p.key.nonce}`]);

          if (deposits.length < proposals.length) {
            // has dangling proposal
            for (const p of proposals) {
              const keyStr = `${p.key.home}-${p.key.dest}-${p.key.nonce}`;
              if (!(keyStr in dmap)) {
                // dangling proposal
                const spass = await this.signaturePassRepo.findByKey(p.key);
                const subsigs = await this.submitSignatureRepo.findByKey(p.key);
                danglingProposals.push({
                  key: p.key,
                  txHashs: p.txHashs,
                  status: ProposalStatus[p.status],
                  sigPassTx: spass?.txHash,
                  voteTxs: subsigs?.map((s) => s.txHash),
                });
              }
            }
          } else {
            // has dangling deposit
            for (const d of deposits) {
              const keyStr = `${d.key.home}-${d.key.dest}-${d.key.nonce}`;
              const spass = await this.signaturePassRepo.findByKey(d.key);
              const subsigs = await this.submitSignatureRepo.findByKey(d.key);
              if (!(keyStr in pmap)) {
                // dangling deposit
                danglingDeposits.push({
                  key: d.key,
                  txHash: d.txHash,
                  sigPassTx: spass?.txHash,
                  voteTxs: subsigs?.map((s) => s.txHash),
                });
              }
            }
          }
          const stat = {
            deposit: deposits.length,
            proposal: proposals.length,
            danglingProposals,
            danglingDeposits,
          };

          result[`${Network[fromChain.network]} -> ${Network[toChain.network]}`] = stat;
        }
      }
    }
    return res.json(result);
  };
}
