import { Router } from 'express';
import { Logger } from 'pino';

import { Proposal } from '../../model';
import { DepositRepo, HeadRepo, ProposalRepo, SignaturePassRepo, SubmitSignatureRepo } from '../../repo';
import { Controller, try$ } from '../interfaces/controller.interface';

export abstract class BaseController implements Controller {
  public path = '';
  public router: Router;
  public log: Logger;

  // repos
  // public headRepo: HeadRepo;
  public submitSignatureRepo: SubmitSignatureRepo;
  public signaturePassRepo: SignaturePassRepo;
  public depositRepo: DepositRepo;
  public proposalRepo: ProposalRepo;

  constructor(rootLogger: Logger, name: string, path: string) {
    this.router = Router();
    this.path = path;
    this.log = rootLogger.child({ ctrl: name });
    this.initializeRoutes();

    // this.headRepo = new HeadRepo();
    this.submitSignatureRepo = new SubmitSignatureRepo();
    this.signaturePassRepo = new SignaturePassRepo();
    this.depositRepo = new DepositRepo();
    this.proposalRepo = new ProposalRepo();
  }

  protected abstract initializeRoutes();
}
