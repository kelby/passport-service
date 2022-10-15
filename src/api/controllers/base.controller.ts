import { Router } from 'express';
import { Logger } from 'pino';

import { DepositRepo, HeadRepo, ProposalRepo, SignaturePassRepo, SubmitSignatureRepo } from '../../repo';
import Controller from '../interfaces/controller.interface';

export abstract class BaseController implements Controller {
  public path = '';
  public router: Router;
  public log: Logger;

  // repos
  public headRepo = new HeadRepo();
  public submitSignatureRepo = new SubmitSignatureRepo();
  public signaturePassRepo = new SignaturePassRepo();
  public depositRepo = new DepositRepo();
  public proposalRepo = new ProposalRepo();

  constructor(rootLogger: Logger, name: string, path: string) {
    this.router = Router();
    this.path = path;
    this.log = rootLogger.child({ ctrl: name });
    this.initializeRoutes();
  }

  protected abstract initializeRoutes();
}
