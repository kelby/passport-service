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

  public async findByHomeAndDest(home, dest: number) {
    return this.model.find({ 'key.home': home, 'key.dest': dest });
  }

  public async countByHomeAndDest(home, dest: number) {
    return this.model.count({ 'key.home': home, 'key.dest': dest });
  }

  public async findByAddress(fromAddr: string) {
    return this.model.find({ fromAddr: fromAddr.toLowerCase() });
  }

  public async create(doc: Deposit) {
    this.model.create(doc);
  }
}
