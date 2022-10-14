import mongoose from 'mongoose';

import { Key } from './key.interface';

export const keySchema = new mongoose.Schema<Key>(
  {
    home: { type: Number, required: true },
    dest: { type: Number, required: true },
    nonce: { type: Number, required: true },
  },
  { _id: false }
);
