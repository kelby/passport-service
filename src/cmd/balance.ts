import { CMD } from './cmd';
import { ERC20, ERC20__factory, ERC20Handler, ERC20Handler__factory } from '../typechain';
import { chainConfigs, Network, ProposalStatus } from '../const';
import { ethers } from 'ethers';
import { Logger } from 'pino';
import BigNumber from 'bignumber.js';
import axios from 'axios';
import { CheckBalance, Proposal } from '../model';

const passport_tokens = require('./passport-tokens.json'); // ABI

const loadTokenList = async () => {
  try {
    const r = await axios.get(
      'https://raw.githubusercontent.com/meterio/token-list/master/generated/passport-tokens.json'
    );
    return r.data;
  } catch (e) {
    return passport_tokens;
  }
};

export class BalanceCMD extends CMD {
  private erc20: ERC20;
  private erc20_handler: ERC20Handler;
  private erc20HandlerAddress: string;

  constructor(rootLogger: Logger) {
    super(rootLogger, 'balance', "");
  }

  public async start() {
    let balanceMap = {};
    const tokenList = await loadTokenList();

    for (const netName in tokenList) {
      console.info('--------- begin ---------', netName);

      for (const chainConfig of chainConfigs) {
        if (netName.toLowerCase() === chainConfig.network.toLowerCase()) {
          let provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);

          this.provider = provider;
          this.erc20HandlerAddress = chainConfig.erc20HandlerAddress;
          this.erc20_handler = ERC20Handler__factory.connect(chainConfig.erc20HandlerAddress, provider);

          break;
        }
      } // chainConfigs

      if (!this.erc20_handler) {
        continue;
      }

      for (let token of tokenList[netName]) {
        let symbol = token.symbol;
        let resourceId = token.resourceId;

        if (!resourceId || resourceId === '0x0000000000000000000000000000000000000000000000000000000000000000') {
          console.log(`skip ${symbol}`);
          continue;
        }

        console.info('symbol:', symbol);

        let erc20_address = token.address;
        this.erc20 = ERC20__factory.connect(erc20_address, this.provider);

        let balance;
        let totalSupply;
        try {
          balance = await this.erc20.balanceOf(this.erc20HandlerAddress);
          totalSupply = await this.erc20.totalSupply();
        } catch (e) {
          console.warn(netName, token.symbol, e.message);
          continue;
        }

        let burnable;
        try {
          burnable = await this.erc20_handler._burnList(erc20_address);
        } catch (e) {
          console.warn(netName, token.symbol, e.message);
          continue;
        }

        if (!balanceMap[token.resourceId]) {
          balanceMap[token.resourceId] = [];
        }

        let result;
        if (burnable) {
          if (isNaN(Number(totalSupply))) {
            continue;
          }

          result = {
            type: 'liability',
            network: netName,
            amount: totalSupply.toString(),
            symbol: symbol,
            tokenAddr: erc20_address,
            handlerAddr: this.erc20HandlerAddress
          };
        } else {
          if (isNaN(Number(balance))) {
            continue;
          }

          result = {
            type: 'asset',
            network: netName,
            amount: balance.toString(),
            symbol: symbol,
            tokenAddr: erc20_address,
            handlerAddr: this.erc20HandlerAddress
          };
        }

        if (result) {
          balanceMap[token.resourceId].push(result);
        }
      } // for tokenList values

      console.info('--------- end ---------', netName);
    } // for tokenList keys

    console.info('----------------------');
    console.info('balanceMap', balanceMap);

    for (const resourceId in balanceMap) {
      let balance2 = new BigNumber(0);
      for (let resultItem of balanceMap[resourceId]) {
        if (resultItem.type === 'asset') {
          balance2 = balance2.plus(new BigNumber(resultItem.amount));
        } else {
          balance2 = balance2.minus(new BigNumber(resultItem.amount));
        }
      }

      try {
        const checkBalance = await this.checkBalanceRepo.findByKey(resourceId);

        if (checkBalance) {
          checkBalance.data = JSON.stringify(balanceMap[resourceId]);
          checkBalance.amount = balance2;
          await checkBalance.save();
        } else {
          const newCheckBalance = {
            resourceId,
            data: JSON.stringify(balanceMap[resourceId]),
            amount: balance2,
          } as CheckBalance;
          await this.checkBalanceRepo.create(newCheckBalance);
        }
      } catch (e) {
        console.warn(e.message)
      }

      console.info('----------------------');
      console.info('resourceId', resourceId, 'balance', balance2);
    }
  }
}

new BalanceCMD(undefined).start();
