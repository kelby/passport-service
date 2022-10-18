import { Request, Response } from 'express';
import { Logger } from 'pino';

import * as pkg from '../../../package.json';
import { try$ } from '../interfaces/controller.interface';
import { BaseController } from './base.controller';

export class HomeController extends BaseController {
  constructor(rootLogger: Logger) {
    super(rootLogger, 'home', '/');
    this.router.get(`${this.path}`, try$(this.getHome));
  }

  getHome = async (req: Request, res: Response) => {
    const headAll = await this.headRepo.findAll();
    let heads = {};
    for (const h of headAll) {
      heads[h.key] = h.num;
    }
    return res.json({ service: 'passport-api', version: pkg.version, heads });
  };
}
