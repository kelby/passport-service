import BigNumber from 'bignumber.js';
import * as mongoose from 'mongoose';

import { ProposalStatus, enumKeys } from '../const';
import { Network } from '../const';
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

  homeChainId: { type: Number, required: true, index: true },
  destChainId: { type: Number, required: true, index: true },
  depositNonce: { type: Number, required: true, index: true },
  destBridgeAddr: { type: String, required: true, index: true },

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

proposalSchema.index({ homeChainId: 1, destChainId: 1, depositNonce: 1, destBridgeAddr: 1 }, { unique: true });

proposalSchema.set('toJSON', {
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret._id;
    return ret;
  },
});

proposalSchema.methods.toSummary = function () {
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

const model = mongoose.model<Proposal & mongoose.Document>('Proposal', proposalSchema);

export default model;
