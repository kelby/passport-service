import BigNumber from 'bignumber.js';
import * as mongoose from 'mongoose';

import { enumKeys } from '../const';
import { Network } from '../const';
import { Deposit } from './deposit.interface';

const depositSchema = new mongoose.Schema<Deposit>({
  network: {
    type: String,
    enum: enumKeys(Network),
    get: (enumValue: string) => Network[enumValue as keyof typeof Network],
    set: (enumValue: Network) => Network[enumValue],
    required: true,
    index: true,
  },

  homeChainId: { type: Number, required: true, index: true },
  destChainId: { type: Number, required: true, index: true },
  depositNonce: { type: Number, required: true, index: true },
  homeBridgeAddr: { type: String, required: true, index: true },

  resourceId: { type: String, required: true, index: true },
  dataHash: { type: String, required: true, index: true },

  fromAddr: { type: String, required: true, index: true },
  toAddr: { type: String, required: true, index: true },
  amount: {
    type: String,
    get: (num: string) => new BigNumber(num),
    set: (bnum: BigNumber) => bnum.toFixed(0),
    required: true,
  },

  txHash: { type: String, required: true, unique: true },
  blockNum: { type: Number, required: true, index: true },
  blockTimestamp: { type: Number, required: true, index: true },
});

depositSchema.index({ homeChainId: 1, destChainId: 1, depositNonce: 1, homeBridgeAddr: 1 }, { unique: true });

depositSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

depositSchema.methods.toSummary = function () {
  return {
    network: this.network,
    direction: `${this.homeChainId} -> ${this.destChainId}`,
    depositNonce: this.depositNonce.toFixed(0),
    resourceID: this.resourceId,
    txHash: this.txHash,
    blockNum: this.blockNum,
    toAddr: this.toAddr,
    amount: this.amount.toFixed(0),
  };
};

const model = mongoose.model<Deposit & mongoose.Document>('Deposit', depositSchema);

export default model;
