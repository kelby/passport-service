import { Key, SignaturePass, SignaturePassModel } from '../model';

export class SignaturePassRepo {
  private model = SignaturePassModel;

  public async exists(key: Key, txHash: string) {
    return this.model.exists({ key, txHash });
  }

  public async create(doc: SignaturePass) {
    await this.model.create(doc);
  }

  public async findByID(key: Key, txHash: string) {
    return this.model.findOne({ key, txHash });
  }
  public async findByKey(key: Key) {
    return this.model.findOne({ key });
  }
}
