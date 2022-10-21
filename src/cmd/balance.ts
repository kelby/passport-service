import { CMD } from './cmd';
import { Bridge, Bridge__factory, ERC20, ERC20__factory, ERC20Handler, ERC20Handler__factory } from '../typechain';
import { chainConfigs, Network } from '../const';
import { ethers } from 'ethers';
import { Logger } from 'pino';

const axios = require('axios');
// const Web3 = require('web3');
// const { loadABI } = require('../const');
// const fs = require('fs');

const loadTokenList = async () => {
  const r = await axios.get(
    'https://raw.githubusercontent.com/meterio/token-list/master/generated/passport-tokens.json'
  );
  return r.data;
};

export class BalanceCMD extends CMD {
  private erc20: ERC20;
  private erc20_handler: ERC20Handler;
  private bridgeAddress: string;
  private erc20HandlerAddress: string;

  constructor(rootLogger: Logger) {
    super(rootLogger, 'balance', Network.meter);
  }

  public async start() {
    const tokenList = await loadTokenList();

    for (const netName in tokenList) {
      if (!this.erc20) {
        for (const fromChain of chainConfigs) {
          if (netName.toLowerCase() === fromChain.network.toLowerCase()) {
            let provider: ethers.providers.JsonRpcProvider;

            provider = new ethers.providers.JsonRpcProvider(fromChain.rpcUrl);

            this.erc20 = ERC20__factory.connect(fromChain.bridgeAddress, provider);
            this.bridgeAddress = fromChain.bridgeAddress;

            this.erc20_handler = ERC20Handler__factory.connect(fromChain.erc20HandlerAddress, provider);
            this.erc20HandlerAddress = fromChain.erc20HandlerAddress;

            break
          }
        }
      }

      if (!this.erc20 || !this.erc20_handler) {
        continue
      }

      const balance = await this.erc20.balanceOf(this.erc20HandlerAddress);
      const totalSupply = await this.erc20.totalSupply();

      for (let token of tokenList[netName]) {
        let erc20_address = token.address;
        const burnable = await this.erc20_handler._burnList(erc20_address);
        let result = { type: '', network: '', amount: '' };
        const symbol = token.symbol;

        if (burnable) {
          result = {
            type: 'liability',
            network: netName,
            amount: totalSupply.toString(),
            // symbol: symbol,
            // tokenAddr: erc20_address,
            // handlerAddr: erc20HandlerAddress,
          };
        } else {
          result = {
            type: 'asset',
            network: netName,
            amount: balance.toString(),
            // symbol: symbol,
            // tokenAddr: erc20_address,
            // handlerAddr: erc20HandlerAddress,
          };
          // resourceMap.set(resourceId, { network, symbol, name });
        }
      }
    }
  }
}

new BalanceCMD(undefined).start();
