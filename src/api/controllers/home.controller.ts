import { Request, Response, Router } from 'express';
import { Logger } from 'pino';

import * as pkg from '../../../package.json';
import { HeadRepo } from '../../repo';
import { try$ } from '../interfaces/controller.interface';
import { BaseController } from './base.controller';

export class HomeController extends BaseController {
  public headRepo = new HeadRepo();
  constructor(rootLogger: Logger) {
    super(rootLogger, 'home', '/');
  }

  protected initializeRoutes() {
    this.router.get(`${this.path}`, try$(this.getHome));
  }

  protected async getHome(req: Request, res: Response) {
    console.log(this.headRepo);
    const headAll = await this.headRepo.findAll();
    let heads = {};
    for (const h of headAll) {
      heads[h.key] = h.num;
    }
    return res.json({ service: 'passport-api', version: pkg.version, heads });
  }
}
