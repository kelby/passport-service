import * as mongoose from 'mongoose';

import { keySchema } from './key.model';
import { SignaturePass } from './signaturePass.interface';

const schema = new mongoose.Schema<SignaturePass>({
  key: { type: keySchema, required: true, index: true },
  resourceId: { type: String, required: true, index: true },
  data: { type: String, required: true, index: true },
  signature: { type: String, required: true, index: true },

  relayerAddr: { type: String, required: true, index: true },
  txHash: { type: String, required: true, index: true },
  blockNum: { type: Number, required: true, index: true },
});

schema.index({ key: 1, txHash: 1 }, { unique: true });
schema.index({ key: 1, resourceId: 1 });
schema.index({ key: 1, resourceId: 1, data: 1 });

schema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

const model = mongoose.model<SignaturePass & mongoose.Document>('SignaturePass', schema);

export default model;
