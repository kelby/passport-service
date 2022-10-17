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

  public async findByKey(key: Key) {
    return this.model.findOne({ key });
  }

  public async create(doc: Proposal) {
    await this.model.create(doc);
  }

  public async updateStatus(key: Key, status: ProposalStatus) {
    await this.model.updateOne({ key }, { $set: { status } });
  }

  public async countByHomeAndDest(home, dest: number) {
    return this.model.count({ 'key.home': home, 'key.dest': dest });
  }
}

export default ProposalRepo;
