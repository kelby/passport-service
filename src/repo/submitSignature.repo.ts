import { Key, SubmitSignature, SubmitSignatureModel } from '../model';

export class SubmitSignatureRepo {
  private model = SubmitSignatureModel;

  public async exists(key: Key) {
    return this.model.exists({ key });
  }

  public async create(doc: SubmitSignature) {
    await this.model.create(doc);
  }

  public async findByTx(txHash: string) {
    return this.model.findOne({ txHash });
  }
}

export default SubmitSignatureRepo;
