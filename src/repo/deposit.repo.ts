import { Deposit, DepositModel, Key } from '../model';

export class DepositRepo {
  private model = DepositModel;

  public async findAll() {
    return this.model.find();
  }

  public async exists(key: Key) {
    return this.model.exists({ key });
  }

  public async findByKey(key: Key) {
    return this.model.findOne({ key });
  }

  public async countByHomeAndDest(home, dest: number) {
    return this.model.count({ 'key.home': home, 'key.dest': dest });
  }

  public async findByAddress(from: string) {
    return this.model.find({ from: from.toLowerCase() });
  }

  public async create(doc: Deposit) {
    this.model.create(doc);
  }
}
