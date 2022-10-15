import BigNumber from 'bignumber.js';

import { Network } from '../const';
import { Key } from './key.interface';

/*
  event SubmitSignature(
    uint8 indexed originDomainID,
    uint8 indexed destinationDomainID,
    uint64 depositNonce,
    bytes32 indexed resourceID,
    bytes data,
    bytes signature
  );
*/
export interface SubmitSignature {
  // event data
  key: Key;
  resourceId: string;
  data: string;
  signature: string;

  // tx detail
  relayerAddr: string;
  txHash: string;
  blockNum: number;
}
