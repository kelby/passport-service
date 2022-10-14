import { Network } from '../const';
import { Key } from './key.interface';

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

  // tx detail
  txHash: string;
  blockNum: number;
  blockTimestamp: number;
}
