import * as mongoose from "mongoose";
import { CheckBalance } from './checkBalance.interface';
import BigNumber from 'bignumber.js';

const checkBalanceSchema = new mongoose.Schema<CheckBalance>({
  resourceId: { type: String, required: true, index: true },
  data: { type: String, required: true, index: true },

  amount: {
    type: String,
    get: (num: string) => new BigNumber(num),
    set: (bnum: BigNumber) => bnum.toFixed(0),
    required: true,
  },
});

checkBalanceSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

const model = mongoose.model<CheckBalance & mongoose.Document>('CheckBalance', checkBalanceSchema, 'checkBalance');

export default model;
