import BigNumber from 'bignumber.js';
import * as mongoose from 'mongoose';

import { ProposalStatus, enumKeys } from '../const';
import { Network } from '../const';
import { keySchema } from './key.model';
import { Proposal } from './proposal.interface';

const proposalSchema = new mongoose.Schema<Proposal>({
  network: {
    type: String,
    enum: enumKeys(Network),
    get: (enumValue: string) => Network[enumValue as keyof typeof Network],
    set: (enumValue: Network) => Network[enumValue],
    required: true,
    index: true,
  },

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

  txHash: { type: String, required: true, unique: true },
  blockNum: { type: Number, required: true, index: true },
  blockTimestamp: { type: Number, required: true, index: true },

  toAddr: { type: String, required: true, index: true },
  amount: {
    type: String,
    get: (num: string) => new BigNumber(num),
    set: (bnum: BigNumber) => bnum.toFixed(0),
    required: true,
  },
});

proposalSchema.index({ homeDomainId: 1, destDomainId: 1, depositNonce: 1, destBridgeAddr: 1 }, { unique: true });

proposalSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

const model = mongoose.model<Proposal & mongoose.Document>('Proposal', proposalSchema);

export default model;
