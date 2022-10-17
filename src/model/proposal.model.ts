import BigNumber from 'bignumber.js';
import * as mongoose from 'mongoose';

import { ProposalStatus, enumKeys } from '../const';
import { keySchema } from './key.model';
import { Proposal } from './proposal.interface';

const proposalSchema = new mongoose.Schema<Proposal>({
  key: { type: keySchema, required: true, unique: true },

  resourceId: { type: String, required: true, index: true },
  dataHash: { type: String, required: true, index: true },
  status: {
    type: String,
    enum: enumKeys(ProposalStatus),
    get: (enumValue: string) => ProposalStatus[enumValue as keyof typeof ProposalStatus],
    set: (enumValue: ProposalStatus) => ProposalStatus[enumValue],
    required: true,
    index: true,
  },

  txHashs: [{ type: String, required: true }],
  createBlockNum: { type: Number, required: true, index: true },
  lastUpdateBlockNum: { type: Number, required: true, index: true },
});

proposalSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

const model = mongoose.model<Proposal & mongoose.Document>('Proposal', proposalSchema, 'proposal');

export default model;
