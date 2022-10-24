import {  CheckBalance, CheckBalanceModel, Key } from '../model';

export class CheckBalanceRepo {
  private model = CheckBalanceModel;

  public async findAll() {
    return this.model.find();
  }

  // public async exists(key: Key) {
  //   return this.model.exists({ key });
  // }

  public async findByKey(resourceId: string) {
    return this.model.findOne({ resourceId });
  }

  // public async countByHomeAndDest(home, dest: number) {
  //   return this.model.count({ 'key.home': home, 'key.dest': dest });
  // }

  public async create(doc: CheckBalance) {
    this.model.create(doc);
  }
}
