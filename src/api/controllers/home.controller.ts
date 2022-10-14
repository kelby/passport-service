import { Request, Response, Router } from 'express';

import * as pkg from '../../../package.json';
import Controller from '../interfaces/controller.interface';

class HomeController implements Controller {
  public path = '';
  public router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.getHome);
  }

  private getHome = async (req: Request, res: Response) => {
    throw new Error("could not process")
    return res.json({ name: 'bridge-api', version: pkg.version, });
  };

}

export default HomeController;
