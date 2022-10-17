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
  domainId: number;
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
  domainId: number;
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

export const chainConfigs: ChainConfig[] = [
  {
    network: Network.ethereum,
    rpcUrl: 'https://mainnet.infura.io/v3/2ad4eeb4c6a14a88b7b16872a0404a9a',
    domainId: 1,
    networkId: 1,
    bridgeAddress: '0xa7E2cE557980618253D9dafdEDb27ecCe2F82167',
    erc20HandlerAddress: '0xEa31ca828F53A41bA2864FA194bb8A2d3f11C0C0',
    startBlockNum: 15648033,
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
    domainId: 2,
    networkId: 43114,
    bridgeAddress: '0xB447acD21831F6615e208c9EEa7E6049dB3391Cd',
    erc20HandlerAddress: '0xeB06fa7e1d400caa3D369776Da45EbB5EbDF9b5B',
    avgBlockTime: 2,
    startBlockNum: 20477952,
    windowSize: 2000,
    nativeTokenDecimals: 18,
    nativeTokenSymbol: 'AVAX',
    throttleCount: 5,
    throttleInterval: 2000,
  },
  {
    network: Network.meter,
    rpcUrl: 'https://rpc.meter.io',
    domainId: 3,
    networkId: 82,
    bridgeAddress: '0x23894d2937A2a4A479f0407909DA5B028049568E',
    erc20HandlerAddress: '0x139d9B458AcDA76457DD99DB3A6a36ca9Cb3bbf1',
    startBlockNum: 28698530,
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
    domainId: 4,
    networkId: 56,
    bridgeAddress: '0x8209815136b35F21B8C0f5AA2E2f915a73530dF9',
    erc20HandlerAddress: '0x83354D47379881e167F7160A80dAC8269Fe946Fa',
    startBlockNum: 21787431,
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
    domainId: 5,
    networkId: 1285,
    bridgeAddress: '0x44F0f7F2bA1C077d27D83b22147744E04874B3a7',
    erc20HandlerAddress: '0xB1eFA941D6081afdE172e29D870f1Bbb91BfABf7',
    startBlockNum: 2676497,
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
    domainId: 6,
    networkId: 361,
    bridgeAddress: '0x1a073fDCc6D9b7eAEc218FE47566Faa85326967D',
    erc20HandlerAddress: '0xe1c892A6cE33cB31c100369aA6fC302d7B96254a',
    startBlockNum: 17311118,
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
    domainId: 7,
    networkId: 333999,
    bridgeAddress: '0xbCD1acAa67863E633241AB5Ca2670853C7f13B0b',
    erc20HandlerAddress: '0x4A0a64621f065C41AAB284F661F8547647f92B07',
    startBlockNum: 6140552,
    avgBlockTime: 8.4,
    windowSize: 5000,
    nativeTokenSymbol: 'POLIS',
    nativeTokenDecimals: 18,
    throttleCount: 5,
    throttleInterval: 2000,
  },
  // {
  //   network: Network.energyweb,
  //   rpcUrl: 'https://rpc.energyweb.org',
  //   domainId: 8,
  //   networkId: 246,
  //   bridgeAddress: '0xC112f793113b2dA428A4f4eD5CC90f5CD6552400',
  //   erc20HandlerAddress: '0x48A6fd66512D45006FC0426576c264D03Dfda304',
  //   startBlockNum: 16316624,
  //   avgBlockTime: 5.1,
  //   windowSize: 5000,
  //   nativeTokenSymbol: 'EWT',
  //   nativeTokenDecimals: 18,
  //   throttleCount: 5,
  //   throttleInterval: 2000,
  // },
  {
    network: Network.moonbeam,
    rpcUrl: 'https://moonbeam.api.onfinality.io/public',
    domainId: 9,
    networkId: 1284,
    bridgeAddress: '0xc9796B65555B18Fe06a071B9F1ff26b76A4823eC',
    erc20HandlerAddress: '0x766E33b910Cd6329a0cBD5F72e48Ec162E38A25D',
    startBlockNum: 1979809,
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
    domainId: 10,
    networkId: 137,
    bridgeAddress: '0xB447acD21831F6615e208c9EEa7E6049dB3391Cd',
    erc20HandlerAddress: '0xeB06fa7e1d400caa3D369776Da45EbB5EbDF9b5B',
    startBlockNum: 33777609,
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
  domainId: 3,
  networkId: 82,
  sigAddress: '0x2C451afd332bd18bB6c8748089142B044523219F',
  startBlockNum: 28698831,
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

export const getChainConfigBydomainId = (domainId: number) => {
  for (const cf of chainConfigs) {
    if (cf.domainId === domainId) {
      return cf;
    }
  }
};
