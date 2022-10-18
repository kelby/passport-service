import { Request, Response } from 'express';
import { Logger } from 'pino';

import { Network, chainConfigs } from '../../const';
import { try$ } from '../interfaces/controller.interface';
import { BaseController } from './base.controller';

export class StatController extends BaseController {
  constructor(rootLogger: Logger) {
    super(rootLogger, 'deposit', '/api/stat');
  }

  protected initializeRoutes() {
    this.router.get(`${this.path}/`, try$(this.getStat));
  }

  private async getStat(req: Request, res: Response) {
    let result = [];
    for (const fromChain of chainConfigs) {
      const home = fromChain.domainId;
      for (const toChain of chainConfigs) {
        const dest = toChain.domainId;
        if (home == dest) {
          continue;
        }

        const dc = await this.depositRepo.countByHomeAndDest(home, dest);
        const pc = await this.proposalRepo.countByHomeAndDest(home, dest);
        if (dc > 0 || pc > 0) {
          result[`${Network[fromChain.network]} -> ${Network[toChain.network]}`] = { deposit: dc, proposal: pc };
        }
      }
    }
    return res.json(result);
  }
}
