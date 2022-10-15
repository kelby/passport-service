import { Request, Response, Router } from 'express';
import { try$ } from 'express-toolbox';
import { Logger } from 'pino';

import * as pkg from '../../../package.json';
import { HeadRepo } from '../../repo';
import { BaseController } from './base.controller';

export class HomeController extends BaseController {
  constructor(rootLogger: Logger) {
    super(rootLogger, 'home', '/');
  }

  protected initializeRoutes() {
    this.router.get(`${this.path}`, try$(this.getHome));
  }

  private async getHome(req: Request, res: Response) {
    const headRepo = new HeadRepo();
    const headAll = await headRepo.findAll();
    let heads = {};
    for (const h of headAll) {
      heads[h.key] = h.num;
    }
    return res.json({ service: 'passport-api', version: pkg.version, heads });
  }
}
