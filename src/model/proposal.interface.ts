import BigNumber from 'bignumber.js';

import { Network, ProposalStatus } from '../const';

export interface Proposal {
  network: Network;

  // id
  homeChainId: number;
  destChainId: number;
  depositNonce: number;
  destBridgeAddr: string;

  // deposit data
  resourceId: string;
  dataHash: string;

  // status
  status: ProposalStatus;

  // tx details
  txHash: string;
  blockNum: number;
  blockTimestamp: number;

  toAddr: string;
  amount: BigNumber;
}
