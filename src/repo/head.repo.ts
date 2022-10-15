import headModel from '../model/head.model';

export class HeadRepo {
  private model = headModel;

  public async findByKey(key: string) {
    return this.model.findOne({ key });
  }

  public async findAll() {
    return this.model.find();
  }

  public async create(key: string, num: number) {
    return this.model.create({ key, num });
  }

  public async upsert(key: string, num: number) {
    return this.model.findOneAndUpdate({ key }, { key, num }, { new: true, upsert: true });
  }
}

export default HeadRepo;
