import { Network } from '../const';
import { Key } from './key.interface';
import BigNumber from 'bignumber.js';

/*
  event SignaturePass(
    uint8 indexed originDomainID,
    uint8 indexed destinationDomainID,
    uint64 depositNonce,
    bytes32 indexed resourceID,
    bytes data,
    bytes signature
  );
*/
export interface SignaturePass {
  network: Network;

  // id
  key: Key;

  // event data
  resourceId: string;
  data: string;
  signature: string;

  // decode data field
  toAddr: string;
  amount: BigNumber;

  // tx detail
  txHash: string;
  blockNum: number;
  blockTimestamp: number;
}
