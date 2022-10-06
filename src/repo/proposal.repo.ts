import { Proposal } from '../model/proposal.interface';
import proposalModel from '../model/proposal.model';

export class ProposalRepo {
  private model = proposalModel;

  public async exists(homeChainId: number, destChainId: number, depositNonce: number, destBridgeAddr: string) {
    return this.model.exists({ homeChainId, destChainId, depositNonce, destBridgeAddr: destBridgeAddr.toLowerCase() });
  }

  public async findAll() {
    return this.model.find();
  }

  public async findByTx(txHash: string) {
    return this.model.findOne({ txHash });
  }

  public async findByID(homeChainId: number, destChainId: number, depositNonce: number, destBridgeAddr: string) {
    return this.model.findOne({ homeChainId, destChainId, depositNonce, destBridgeAddr: destBridgeAddr.toLowerCase() });
  }

  public async create(doc: Proposal) {
    await this.model.create(doc);
  }
}

export default ProposalRepo;
