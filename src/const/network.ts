import { ethers } from 'ethers';

export enum Network {
  ethereum = 'ethereum',
  avalanche = 'avalanche',
  meter = 'meter',
  moonriver = 'moonriver',
  theta = 'theta',
  bsc = 'bsc',
  energyweb = 'energyweb',
  polis = 'polis',
  moonbeam = 'moonbeam',
  polygon = 'polygon',
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
  avgBlockTime: number;
  windowSize: number;
  nativeTokenDecimals: number;
  nativeTokenSymbol?: string;
  throttleCount: number;
  throttleInterval: number; // throttle count / interval
}

export class RelayConfig {
  network: Network;
  chainId: number;
  networkId: number;
  rpcUrl: string;
  sigAddress: string;
  startBlockNum: number;
  provider?: ethers.providers.JsonRpcProvider;
  bridge?: ethers.Contract;
  avgBlockTime: number;
  windowSize: number;
  nativeTokenDecimals: number;
  nativeTokenSymbol?: string;
  throttleCount: number;
  throttleInterval: number; // throttle count / interval
}

const chainConfigs: ChainConfig[] = [
  {
    network: Network.ethereum,
    rpcUrl: 'https://mainnet.infura.io/v3/2ad4eeb4c6a14a88b7b16872a0404a9a',
    chainId: 1,
    networkId: 1,
    bridgeAddress: '0xb61B5aca15193ECB719433d0E5c066f9980E1e83',
    erc20HandlerAddress: '0xde4fC7C3C5E7bE3F16506FcC790a8D93f8Ca0b40',
    startBlockNum: 14179960,
    avgBlockTime: 12.06,
    windowSize: 10000,
    nativeTokenDecimals: 18,
    nativeTokenSymbol: 'ETH',
    throttleCount: 5,
    throttleInterval: 2000,
  },
  {
    network: Network.avalanche,
    rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
    chainId: 2,
    networkId: 43114,
    bridgeAddress: '0x6154a8611fb02f250eA3FA0C8C8a8CB56931eBf2',
    erc20HandlerAddress: '0x48A6fd66512D45006FC0426576c264D03Dfda304',
    avgBlockTime: 2,
    startBlockNum: 10748603,
    windowSize: 2000,
    nativeTokenDecimals: 18,
    nativeTokenSymbol: 'AVAX',
    throttleCount: 5,
    throttleInterval: 2000,
  },
  {
    network: Network.meter,
    rpcUrl: 'https://rpc.meter.io',
    chainId: 3,
    networkId: 82,
    bridgeAddress: '0x411b6aef79d44CEa36979Ca1525831C8DE37Da90',
    erc20HandlerAddress: '0x60f1ABAa3ED8A573c91C65A5b82AeC4BF35b77b8',
    startBlockNum: 20826291,
    avgBlockTime: 2.33,
    windowSize: 10000,
    nativeTokenDecimals: 18,
    nativeTokenSymbol: 'MTR',
    throttleCount: 5,
    throttleInterval: 2000,
  },
  {
    network: Network.bsc,
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    chainId: 4,
    networkId: 56,
    bridgeAddress: '0x0316f3A2f01bf3934f10F24217a0F802Eac3FBD7',
    erc20HandlerAddress: '0x5945241BBB68B4454bB67Bd2B069e74C09AC3D51',
    startBlockNum: 15121105,
    avgBlockTime: 3,
    windowSize: 5000,
    nativeTokenDecimals: 18,
    nativeTokenSymbol: 'BNB',
    throttleCount: 5,
    throttleInterval: 2000,
  },
  {
    network: Network.moonriver,
    rpcUrl: 'https://moonriver.api.onfinality.io/public',
    chainId: 5,
    networkId: 1285,
    bridgeAddress: '0xa53cC329AD9555c51F02f37b3cC93a2be4a166Be',
    erc20HandlerAddress: '0x48A6fd66512D45006FC0426576c264D03Dfda304',
    startBlockNum: 1464507,
    avgBlockTime: 13,
    windowSize: 5000,
    nativeTokenDecimals: 18,
    nativeTokenSymbol: 'MOVR',
    throttleCount: 5,
    throttleInterval: 2000,
  },
  {
    network: Network.theta,
    rpcUrl: 'https://eth-rpc-api.thetatoken.org/rpc',
    chainId: 6,
    networkId: 361,
    bridgeAddress: '0xF6853fbEF2a90be8cB66364957fB8B7793c03656',
    erc20HandlerAddress: '0x48A6fd66512D45006FC0426576c264D03Dfda304',
    startBlockNum: 14063184,
    avgBlockTime: 6,
    windowSize: 5000,
    nativeTokenSymbol: 'TFUEL',
    nativeTokenDecimals: 18,
    throttleCount: 5,
    throttleInterval: 2000,
  },
  {
    network: Network.polis,
    rpcUrl: 'https://rpc.polis.tech',
    chainId: 7,
    networkId: 333999,
    bridgeAddress: '0x6154a8611fb02f250eA3FA0C8C8a8CB56931eBf2',
    erc20HandlerAddress: '0x911F32FD5d347b4EEB61fDb80d9F1063Be1E78E6',
    startBlockNum: 2681117,
    avgBlockTime: 8.4,
    windowSize: 5000,
    nativeTokenSymbol: 'POLIS',
    nativeTokenDecimals: 18,
    throttleCount: 5,
    throttleInterval: 2000,
  },
  {
    network: Network.energyweb,
    rpcUrl: 'https://rpc.energyweb.org',
    chainId: 8,
    networkId: 246,
    bridgeAddress: '0xC112f793113b2dA428A4f4eD5CC90f5CD6552400',
    erc20HandlerAddress: '0x48A6fd66512D45006FC0426576c264D03Dfda304',
    startBlockNum: 16316624,
    avgBlockTime: 5.1,
    windowSize: 5000,
    nativeTokenSymbol: 'EWT',
    nativeTokenDecimals: 18,
    throttleCount: 5,
    throttleInterval: 2000,
  },
  {
    network: Network.moonbeam,
    rpcUrl: 'https://moonbeam.api.onfinality.io/public',
    chainId: 9,
    networkId: 1284,
    bridgeAddress: '0x39e592999Df2fd3B6f9261b0cfDeC72992F5aEFC',
    erc20HandlerAddress: '0x911F32FD5d347b4EEB61fDb80d9F1063Be1E78E6',
    startBlockNum: 378117,
    avgBlockTime: 12.5,
    windowSize: 5000,
    nativeTokenSymbol: 'GLMR',
    nativeTokenDecimals: 18,
    throttleCount: 5,
    throttleInterval: 2000,
  },
  {
    network: Network.polygon,
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 10,
    networkId: 137,
    bridgeAddress: '0x92D144A99bD3aB1177B8Df600769Ad5422DE7819',
    erc20HandlerAddress: '0x123455360bE78C9289B38bcb4DbA427D9a6cD440',
    startBlockNum: 24790550,
    avgBlockTime: 2,
    windowSize: 10000,
    nativeTokenSymbol: 'MATIC',
    nativeTokenDecimals: 18,
    throttleCount: 5,
    throttleInterval: 2000,
  },
];

export const relayConfig: RelayConfig = {
  network: Network.meter,
  rpcUrl: 'https://rpc.meter.io',
  chainId: 3,
  networkId: 82,
  sigAddress: '0x2C451afd332bd18bB6c8748089142B044523219F',
  startBlockNum: 20826291,
  avgBlockTime: 2.33,
  windowSize: 10000,
  nativeTokenDecimals: 18,
  nativeTokenSymbol: 'MTR',
  throttleCount: 5,
  throttleInterval: 2000,
};

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
