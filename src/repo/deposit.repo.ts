import { Network } from '../const';
import { Deposit, DepositModel, Key } from '../model';

export class DepositRepo {
  private model = DepositModel;

  public async findAll() {
    return this.model.find();
  }

  public async exists(key: Key) {
    return this.model.exists({ key });
  }

  public async findByID(key: Key) {
    return this.model.findOne({ key });
  }

  public async existsTx(txHash: string) {
    return this.model.exists({ txHash });
  }

  public async findByTx(txHash: string) {
    return this.model.findOne({ txHash });
  }

  public async findLastDepositByNetwork(network: Network) {
    return this.model.findOne({ network }).sort({ blockNum: -1 });
  }

  public async create(doc: Deposit) {
    this.model.create(doc);
  }
}

export default DepositRepo;
