import BigNumber from 'bignumber.js';

import { Network, ProposalStatus } from '../const';
import { Key } from './key.interface';

export interface Proposal {
  network: Network;

  // id
  key: Key;

  // deposit data
  resourceId: string;
  dataHash: string;

  // status
  status: ProposalStatus;

  toAddr: string;
  amount: BigNumber;

  // tx details
  txHash: string;
  blockNum: number;
  blockTimestamp: number;
}
