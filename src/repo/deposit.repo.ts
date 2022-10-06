import { Network } from '../const';
import { Deposit } from '../model/deposit.interface';
import depositModel from '../model/deposit.model';

export class DepositRepo {
  private model = depositModel;

  public async findAll() {
    return this.model.find();
  }

  public async exists(homeChainId: number, destChainId: number, depositNonce: number, homeBridgeAddr: string) {
    return this.model.exists({ homeChainId, destChainId, depositNonce, homeBridgeAddr: homeBridgeAddr.toLowerCase() });
  }

  public async findByID(homeChainId: number, destChainId: number, depositNonce: number, homeBridgeAddr: string) {
    return this.model.findOne({ homeChainId, destChainId, depositNonce, homeBridgeAddr: homeBridgeAddr.toLowerCase() });
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
