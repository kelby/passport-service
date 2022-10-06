import BigNumber from 'bignumber.js';

import { Network } from '../const';

export interface Deposit {
  network: Network;

  // id
  homeChainId: number;
  destChainId: number;
  depositNonce: number;
  homeBridgeAddr: string;

  // deposit data
  resourceId: string;
  dataHash: string;

  // address
  fromAddr: string;
  toAddr: string;
  amount: BigNumber;

  // tx detail
  txHash: string;
  blockNum: number;
  blockTimestamp: number;
}
