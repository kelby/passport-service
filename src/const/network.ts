import { ethers } from 'ethers';

export enum Network {
  Ethereum = 'Ethereum',
  Avalanche = 'Avalanche',
  Meter = 'Meter',
  Moonriver = 'Moonriver',
  Theta = 'Theta',
  BSC = 'BSC',
  EnergyWeb = 'EnergyWeb',
  Polis = 'Polis',
  Moonbeam = 'Moonbeam',
  Polygon = 'Polygon',
}

export class ChainConfig {
  network: Network;
  chainId: number;
  networkId: number;
  rpcUrl: string;
  bridgeAddress: string;
  erc20HandlerAddress: string;
  startBlockNum: number;
  provider?: ethers.providers.JsonRpcProvider;
  bridge?: ethers.Contract;
  windowSize: number;
  nativeTokenDecimals: number;
  nativeTokenSymbol?: string;
}

const chainConfigs: ChainConfig[] = [
  {
    network: Network.Ethereum,
    rpcUrl: 'https://mainnet.infura.io/v3/2ad4eeb4c6a14a88b7b16872a0404a9a',
    chainId: 1,
    networkId: 1,
    bridgeAddress: '0xb61B5aca15193ECB719433d0E5c066f9980E1e83',
    erc20HandlerAddress: '0xde4fC7C3C5E7bE3F16506FcC790a8D93f8Ca0b40',
    startBlockNum: 14179960,
    windowSize: 500000,
    nativeTokenDecimals: 18,
    nativeTokenSymbol: 'ETH',
  },
  {
    network: Network.Avalanche,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: 2,
    networkId: 43114,
    bridgeAddress: '0x6154a8611fb02f250eA3FA0C8C8a8CB56931eBf2',
    erc20HandlerAddress: '0x48A6fd66512D45006FC0426576c264D03Dfda304',
    startBlockNum: 10748603,
    windowSize: 2000,
    nativeTokenDecimals: 18,
    nativeTokenSymbol: 'AVAX',
  },
  {
    network: Network.Meter,
    rpcUrl: 'https://rpc.meter.io',
    chainId: 3,
    networkId: 82,
    bridgeAddress: '0x411b6aef79d44CEa36979Ca1525831C8DE37Da90',
    erc20HandlerAddress: '0x60f1ABAa3ED8A573c91C65A5b82AeC4BF35b77b8',
    startBlockNum: 20826291,
    windowSize: 1000000,
    nativeTokenDecimals: 18,
    nativeTokenSymbol: 'MTR',
  },
  {
    network: Network.BSC,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    chainId: 4,
    networkId: 56,
    bridgeAddress: '0x0316f3A2f01bf3934f10F24217a0F802Eac3FBD7',
    erc20HandlerAddress: '0x5945241BBB68B4454bB67Bd2B069e74C09AC3D51',
    startBlockNum: 15121105,
    windowSize: 5000,
    nativeTokenDecimals: 18,
    nativeTokenSymbol: 'BNB',
  },
  {
    network: Network.Moonriver,
    rpcUrl: 'https://moonriver.api.onfinality.io/public',
    chainId: 5,
    networkId: 1285,
    bridgeAddress: '0xa53cC329AD9555c51F02f37b3cC93a2be4a166Be',
    erc20HandlerAddress: '0x48A6fd66512D45006FC0426576c264D03Dfda304',
    startBlockNum: 1464507,
    windowSize: 5000,
    nativeTokenDecimals: 18,
    nativeTokenSymbol: 'MOVR',
  },
  {
    network: Network.Theta,
    rpcUrl: 'https://eth-rpc-api.thetatoken.org/rpc',
    chainId: 6,
    networkId: 361,
    bridgeAddress: '0xF6853fbEF2a90be8cB66364957fB8B7793c03656',
    erc20HandlerAddress: '0x48A6fd66512D45006FC0426576c264D03Dfda304',
    startBlockNum: 14063184,
    windowSize: 5000,
    nativeTokenSymbol: 'TFUEL',
    nativeTokenDecimals: 18,
  },
  {
    network: Network.Polis,
    rpcUrl: 'https://rpc.polis.tech',
    chainId: 7,
    networkId: 333999,
    bridgeAddress: '0x6154a8611fb02f250eA3FA0C8C8a8CB56931eBf2',
    erc20HandlerAddress: '0x911F32FD5d347b4EEB61fDb80d9F1063Be1E78E6',
    startBlockNum: 2681117,
    windowSize: 10000,
    nativeTokenSymbol: 'POLIS',
    nativeTokenDecimals: 18,
  },
  {
    network: Network.EnergyWeb,
    rpcUrl: 'https://rpc.energyweb.org',
    chainId: 8,
    networkId: 246,
    bridgeAddress: '0xC112f793113b2dA428A4f4eD5CC90f5CD6552400',
    erc20HandlerAddress: '0x48A6fd66512D45006FC0426576c264D03Dfda304',
    startBlockNum: 16316624,
    windowSize: 10000,
    nativeTokenSymbol: 'EWT',
    nativeTokenDecimals: 18,
  },
  {
    network: Network.Moonbeam,
    rpcUrl: 'https://moonbeam.api.onfinality.io/public',
    chainId: 9,
    networkId: 1284,
    bridgeAddress: '0x39e592999Df2fd3B6f9261b0cfDeC72992F5aEFC',
    erc20HandlerAddress: '0x911F32FD5d347b4EEB61fDb80d9F1063Be1E78E6',
    startBlockNum: 378117,
    windowSize: 10000,
    nativeTokenSymbol: 'GLMR',
    nativeTokenDecimals: 18,
  },
  {
    network: Network.Polygon,
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 10,
    networkId: 137,
    bridgeAddress: '0x92D144A99bD3aB1177B8Df600769Ad5422DE7819',
    erc20HandlerAddress: '0x123455360bE78C9289B38bcb4DbA427D9a6cD440',
    startBlockNum: 24790550,
    windowSize: 10000,
    nativeTokenSymbol: 'MATIC',
    nativeTokenDecimals: 18,
  },
];

export const getChainConfig = (network: Network) => {
  for (const cf of chainConfigs) {
    if (cf.network === network) {
      return cf;
    }
  }
};

export const getChainConfigByChainId = (chainId: number) => {
  for (const cf of chainConfigs) {
    if (cf.chainId === chainId) {
      return cf;
    }
  }
};
