import BigNumber from 'bignumber.js';

import { Network } from '../const';
import { Key } from './key.interface';

export interface Deposit {
  network: Network;

  // id
  key: Key;

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
