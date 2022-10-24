import mongoose from 'mongoose';

import { Balance } from './balance.interface';

export const BalanceSchema = new mongoose.Schema<Balance>(
  {
    home: { type: Number, required: true },
    dest: { type: Number, required: true },
    nonce: { type: Number, required: true },
  },
  { _id: false }
);
