import { ProposalStatus } from '../const';
import { Key, Proposal, ProposalModel } from '../model';

export class ProposalRepo {
  private model = ProposalModel;

  public async exists(key: Key) {
    return this.model.exists({ key });
  }

  public async findAll() {
    return this.model.find();
  }

  public async findByTx(txHash: string) {
    return this.model.findOne({ txHash });
  }

  public async findByKey(key: Key) {
    return this.model.findOne({ key });
  }

  public async create(doc: Proposal) {
    await this.model.create(doc);
  }

  public async existsTx(txHash: string) {
    return this.model.exists({ txHash });
  }

  public async updateStatus(key: Key, status: ProposalStatus) {
    await this.model.updateOne({ key }, { $set: { status } });
  }
}

export default ProposalRepo;
