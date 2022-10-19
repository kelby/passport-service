import { BigNumber } from 'bignumber.js';
import { ethers, utils } from 'ethers';
import { _toEscapedUtf8String } from 'ethers/lib/utils';

export const decodeCalldata = (data: string) => {
  let calldata = data;
  const len = 2 + 32 * 3 * 2 - calldata.length;
  if (len < 0) {
    console.log(`error decoding data: ${data}, call decode ampl data`);
    return decodeAMPLCalldata(data);
  }
  calldata = data + '0'.repeat(len);
  const decodedData = utils.defaultAbiCoder.decode(['uint256', 'uint64', 'bytes32'], calldata);

  const toAddr = utils.hexDataSlice(decodedData[2], 0, decodedData[1].toNumber());
  const amount = new BigNumber(decodedData[0].toString());

  return { toAddr, amount };
};

const decodeAMPLCalldata = (data: string) => {
  let calldata = data;
  const len = 2 + 32 * 2 * 5 - calldata.length;
  if (len < 0) {
    throw new Error(`Invalid len for decoding ampl data: ${data}, skip now `);
  }
  calldata = data + '0'.repeat(len);
  const decodedData = utils.defaultAbiCoder.decode(['uint256', 'address', 'address', 'uint256', 'uint256'], calldata);
  // len [depositor, recipient, amount, totalSupply]

  console.log(decodedData);
  const toAddr = utils.hexDataSlice(decodedData[2], 0, 40);
  const amount = new BigNumber(decodedData[3].toString());

  return { toAddr, amount };
};
