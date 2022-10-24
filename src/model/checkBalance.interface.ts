import BigNumber from 'bignumber.js';

export interface CheckBalance {
  // core data
  resourceId: string;
  data: string;

  amount: BigNumber;
}
