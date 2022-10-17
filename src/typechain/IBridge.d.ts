/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import {
  ethers,
  EventFilter,
  Signer,
  BigNumber,
  BigNumberish,
  PopulatedTransaction,
} from "ethers";
import {
  Contract,
  ContractTransaction,
  Overrides,
  PayableOverrides,
  CallOverrides,
} from "@ethersproject/contracts";
import { BytesLike } from "@ethersproject/bytes";
import { Listener, Provider } from "@ethersproject/providers";
import { FunctionFragment, EventFragment, Result } from "@ethersproject/abi";

interface IBridgeInterface extends ethers.utils.Interface {
  functions: {
    "_domainID()": FunctionFragment;
    "_relayerThreshold()": FunctionFragment;
    "_resourceIDToHandlerAddress(bytes32)": FunctionFragment;
    "checkSignature(uint8,uint64,bytes32,bytes,bytes)": FunctionFragment;
    "deposit(uint8,bytes32,bytes,bytes)": FunctionFragment;
    "getProposal(uint8,uint64,bytes32,bytes)": FunctionFragment;
  };

  encodeFunctionData(functionFragment: "_domainID", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "_relayerThreshold",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "_resourceIDToHandlerAddress",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "checkSignature",
    values: [BigNumberish, BigNumberish, BytesLike, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "deposit",
    values: [BigNumberish, BytesLike, BytesLike, BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getProposal",
    values: [BigNumberish, BigNumberish, BytesLike, BytesLike]
  ): string;

  decodeFunctionResult(functionFragment: "_domainID", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "_relayerThreshold",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "_resourceIDToHandlerAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "checkSignature",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getProposal",
    data: BytesLike
  ): Result;

  events: {};
}

export class IBridge extends Contract {
  connect(signerOrProvider: Signer | Provider | string): this;
  attach(addressOrName: string): this;
  deployed(): Promise<this>;

  on(event: EventFilter | string, listener: Listener): this;
  once(event: EventFilter | string, listener: Listener): this;
  addListener(eventName: EventFilter | string, listener: Listener): this;
  removeAllListeners(eventName: EventFilter | string): this;
  removeListener(eventName: any, listener: Listener): this;

  interface: IBridgeInterface;

  functions: {
    _domainID(overrides?: Overrides): Promise<ContractTransaction>;

    "_domainID()"(overrides?: Overrides): Promise<ContractTransaction>;

    _relayerThreshold(overrides?: CallOverrides): Promise<{
      0: number;
    }>;

    "_relayerThreshold()"(overrides?: CallOverrides): Promise<{
      0: number;
    }>;

    _resourceIDToHandlerAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    "_resourceIDToHandlerAddress(bytes32)"(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: string;
    }>;

    checkSignature(
      domainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    "checkSignature(uint8,uint64,bytes32,bytes,bytes)"(
      domainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: boolean;
    }>;

    deposit(
      destinationDomainID: BigNumberish,
      resourceID: BytesLike,
      depositData: BytesLike,
      feeData: BytesLike,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>;

    "deposit(uint8,bytes32,bytes,bytes)"(
      destinationDomainID: BigNumberish,
      resourceID: BytesLike,
      depositData: BytesLike,
      feeData: BytesLike,
      overrides?: PayableOverrides
    ): Promise<ContractTransaction>;

    getProposal(
      originDomainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: {
        _status: number;
        _yesVotes: BigNumber;
        _yesVotesTotal: number;
        _proposedBlock: number;
        0: number;
        1: BigNumber;
        2: number;
        3: number;
      };
    }>;

    "getProposal(uint8,uint64,bytes32,bytes)"(
      originDomainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      0: {
        _status: number;
        _yesVotes: BigNumber;
        _yesVotesTotal: number;
        _proposedBlock: number;
        0: number;
        1: BigNumber;
        2: number;
        3: number;
      };
    }>;
  };

  _domainID(overrides?: Overrides): Promise<ContractTransaction>;

  "_domainID()"(overrides?: Overrides): Promise<ContractTransaction>;

  _relayerThreshold(overrides?: CallOverrides): Promise<number>;

  "_relayerThreshold()"(overrides?: CallOverrides): Promise<number>;

  _resourceIDToHandlerAddress(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  "_resourceIDToHandlerAddress(bytes32)"(
    arg0: BytesLike,
    overrides?: CallOverrides
  ): Promise<string>;

  checkSignature(
    domainID: BigNumberish,
    depositNonce: BigNumberish,
    resourceID: BytesLike,
    data: BytesLike,
    signature: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  "checkSignature(uint8,uint64,bytes32,bytes,bytes)"(
    domainID: BigNumberish,
    depositNonce: BigNumberish,
    resourceID: BytesLike,
    data: BytesLike,
    signature: BytesLike,
    overrides?: CallOverrides
  ): Promise<boolean>;

  deposit(
    destinationDomainID: BigNumberish,
    resourceID: BytesLike,
    depositData: BytesLike,
    feeData: BytesLike,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>;

  "deposit(uint8,bytes32,bytes,bytes)"(
    destinationDomainID: BigNumberish,
    resourceID: BytesLike,
    depositData: BytesLike,
    feeData: BytesLike,
    overrides?: PayableOverrides
  ): Promise<ContractTransaction>;

  getProposal(
    originDomainID: BigNumberish,
    depositNonce: BigNumberish,
    resourceID: BytesLike,
    data: BytesLike,
    overrides?: CallOverrides
  ): Promise<{
    _status: number;
    _yesVotes: BigNumber;
    _yesVotesTotal: number;
    _proposedBlock: number;
    0: number;
    1: BigNumber;
    2: number;
    3: number;
  }>;

  "getProposal(uint8,uint64,bytes32,bytes)"(
    originDomainID: BigNumberish,
    depositNonce: BigNumberish,
    resourceID: BytesLike,
    data: BytesLike,
    overrides?: CallOverrides
  ): Promise<{
    _status: number;
    _yesVotes: BigNumber;
    _yesVotesTotal: number;
    _proposedBlock: number;
    0: number;
    1: BigNumber;
    2: number;
    3: number;
  }>;

  callStatic: {
    _domainID(overrides?: CallOverrides): Promise<number>;

    "_domainID()"(overrides?: CallOverrides): Promise<number>;

    _relayerThreshold(overrides?: CallOverrides): Promise<number>;

    "_relayerThreshold()"(overrides?: CallOverrides): Promise<number>;

    _resourceIDToHandlerAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    "_resourceIDToHandlerAddress(bytes32)"(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<string>;

    checkSignature(
      domainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    "checkSignature(uint8,uint64,bytes32,bytes,bytes)"(
      domainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<boolean>;

    deposit(
      destinationDomainID: BigNumberish,
      resourceID: BytesLike,
      depositData: BytesLike,
      feeData: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    "deposit(uint8,bytes32,bytes,bytes)"(
      destinationDomainID: BigNumberish,
      resourceID: BytesLike,
      depositData: BytesLike,
      feeData: BytesLike,
      overrides?: CallOverrides
    ): Promise<void>;

    getProposal(
      originDomainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      _status: number;
      _yesVotes: BigNumber;
      _yesVotesTotal: number;
      _proposedBlock: number;
      0: number;
      1: BigNumber;
      2: number;
      3: number;
    }>;

    "getProposal(uint8,uint64,bytes32,bytes)"(
      originDomainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<{
      _status: number;
      _yesVotes: BigNumber;
      _yesVotesTotal: number;
      _proposedBlock: number;
      0: number;
      1: BigNumber;
      2: number;
      3: number;
    }>;
  };

  filters: {};

  estimateGas: {
    _domainID(overrides?: Overrides): Promise<BigNumber>;

    "_domainID()"(overrides?: Overrides): Promise<BigNumber>;

    _relayerThreshold(overrides?: CallOverrides): Promise<BigNumber>;

    "_relayerThreshold()"(overrides?: CallOverrides): Promise<BigNumber>;

    _resourceIDToHandlerAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "_resourceIDToHandlerAddress(bytes32)"(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    checkSignature(
      domainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "checkSignature(uint8,uint64,bytes32,bytes,bytes)"(
      domainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    deposit(
      destinationDomainID: BigNumberish,
      resourceID: BytesLike,
      depositData: BytesLike,
      feeData: BytesLike,
      overrides?: PayableOverrides
    ): Promise<BigNumber>;

    "deposit(uint8,bytes32,bytes,bytes)"(
      destinationDomainID: BigNumberish,
      resourceID: BytesLike,
      depositData: BytesLike,
      feeData: BytesLike,
      overrides?: PayableOverrides
    ): Promise<BigNumber>;

    getProposal(
      originDomainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;

    "getProposal(uint8,uint64,bytes32,bytes)"(
      originDomainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<BigNumber>;
  };

  populateTransaction: {
    _domainID(overrides?: Overrides): Promise<PopulatedTransaction>;

    "_domainID()"(overrides?: Overrides): Promise<PopulatedTransaction>;

    _relayerThreshold(overrides?: CallOverrides): Promise<PopulatedTransaction>;

    "_relayerThreshold()"(
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    _resourceIDToHandlerAddress(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "_resourceIDToHandlerAddress(bytes32)"(
      arg0: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    checkSignature(
      domainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "checkSignature(uint8,uint64,bytes32,bytes,bytes)"(
      domainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      signature: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    deposit(
      destinationDomainID: BigNumberish,
      resourceID: BytesLike,
      depositData: BytesLike,
      feeData: BytesLike,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>;

    "deposit(uint8,bytes32,bytes,bytes)"(
      destinationDomainID: BigNumberish,
      resourceID: BytesLike,
      depositData: BytesLike,
      feeData: BytesLike,
      overrides?: PayableOverrides
    ): Promise<PopulatedTransaction>;

    getProposal(
      originDomainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;

    "getProposal(uint8,uint64,bytes32,bytes)"(
      originDomainID: BigNumberish,
      depositNonce: BigNumberish,
      resourceID: BytesLike,
      data: BytesLike,
      overrides?: CallOverrides
    ): Promise<PopulatedTransaction>;
  };
}