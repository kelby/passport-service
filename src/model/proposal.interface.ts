import BigNumber from 'bignumber.js';

import { Network, ProposalStatus } from '../const';
import { Key } from './key.interface';

export interface Proposal {
  // id
  key: Key;

  // event data
  resourceId: string;
  dataHash: string;
  status: ProposalStatus;

  // tx details
  txHashs: string[];
  createBlockNum: number;
  lastUpdateBlockNum: number;
}
