import { resourceLimits } from 'worker_threads';

import { Request, Response } from 'express';
import { Logger } from 'pino';

import { ProposalStatus } from '../../const';
import { try$ } from '../interfaces/controller.interface';
import { BaseController } from './base.controller';

export class DepositController extends BaseController {
  constructor(rootLogger: Logger) {
    super(rootLogger, 'deposit', '/api/deposit');
    this.router.get(`${this.path}/:home/:dest/:nonce`, try$(this.getDepositByKey));
    this.router.get(`${this.path}/history/:address`, try$(this.getHistoryDeposits));
  }

  getDepositByKey = async (req: Request, res: Response) => {
    const { home, dest, nonce } = req.params;
    const key = { home: Number(home), dest: Number(dest), nonce: Number(nonce) };
    const deposit = await this.depositRepo.findByKey(key);
    if (!deposit) {
      return res.json({ key, status: 'deposit not found' });
    }
    let status = 'created';
    const sigs = await this.submitSignatureRepo.findByKey(key);
    const nsig = sigs.length;
    if (nsig > 0) {
      status = 'voted';
    }
    const spass = await this.signaturePassRepo.findByKey(key);
    if (spass) {
      status = 'passed';
    }
    const proposal = await this.proposalRepo.findByKey(key);
    if (proposal) {
      status = ProposalStatus[proposal.status];
    }
    return res.json({
      ...deposit.toJSON(),
      status,
      votedRelayer: sigs.map((s) => s.relayerAddr),
      voteTxs: sigs.map((s) => s.txHash),
      sigPassTx: spass?.txHash,
      proposalTxs: proposal?.txHashs,
    });
  };

  getHistoryDeposits = async (req: Request, res: Response) => {
    const { address } = req.params;
    const deposits = await this.depositRepo.findByAddress(address);
    if (!deposits || deposits.length < 0) {
      return res.json({ address, status: 'deposit not found' });
    }
    const result = [];
    for (const deposit of deposits) {
      let status = 'created';
      const sigs = await this.submitSignatureRepo.findByKey(deposit.key);
      const nsig = sigs.length;
      if (nsig > 0) {
        status = 'voted';
      }
      const spass = await this.signaturePassRepo.findByKey(deposit.key);
      if (spass) {
        status = 'passed';
      }
      const proposal = await this.proposalRepo.findByKey(deposit.key);
      if (proposal) {
        status = ProposalStatus[proposal.status].toLowerCase();
      }
      result.push({
        ...deposit.toJSON(),
        status,
        votedRelayer: sigs.map((s) => s.relayerAddr),
        voteTxs: sigs.map((s) => s.txHash),
        sigPassTx: spass?.txHash,
        proposalTxs: proposal?.txHashs,
      });
    }
    return res.json(result);
  };
}
