import BigNumber from 'bignumber.js';
import * as mongoose from 'mongoose';

import { Deposit } from './deposit.interface';
import { keySchema } from './key.model';

const depositSchema = new mongoose.Schema<Deposit>({
  key: { type: keySchema, required: true, unique: true },

  resourceId: { type: String, required: true, index: true },
  data: { type: String, required: true, index: true },

  fromAddr: { type: String, required: true, index: true },
  toAddr: { type: String, required: true, index: true },
  amount: {
    type: String,
    get: (num: string) => new BigNumber(num),
    set: (bnum: BigNumber) => bnum.toFixed(0),
    required: true,
  },

  txHash: { type: String, required: true, index: true },
  blockNum: { type: Number, required: true, index: true },
});

depositSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

depositSchema.index({ 'key.home': 1, 'key.dest': 1 });

const model = mongoose.model<Deposit & mongoose.Document>('Deposit', depositSchema, 'deposit');

export default model;
