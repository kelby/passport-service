import { Key, SubmitSignature, SubmitSignatureModel } from '../model';

export class SubmitSignatureRepo {
  private model = SubmitSignatureModel;

  public async exists(key: Key, txHash: string) {
    return this.model.exists({ key, txHash });
  }

  public async create(doc: SubmitSignature) {
    await this.model.create(doc);
  }

  public async findByID(key: Key, txHash: string) {
    return this.model.findOne({ key, txHash });
  }

  public async findByKey(key: Key) {
    return this.model.find({ key });
  }
}
