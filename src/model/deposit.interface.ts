import BigNumber from 'bignumber.js';

import { Network } from '../const';
import { Key } from './key.interface';

export interface Deposit {
  // id
  key: Key;

  // event data
  resourceId: string;
  data: string;

  // decoded
  fromAddr: string;
  toAddr: string;
  amount: BigNumber;

  // tx detail
  txHash: string;
  blockNum: number;
}
