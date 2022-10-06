import * as fs from 'fs';
import * as path from 'path';

import axios from 'axios';
import BigNumber from 'bignumber.js';

import { getSuffix, loadCSV } from '.';

axios.defaults.timeout = 50000;
export interface CurrPrices {
  ETH: number;
  MTR: number;
  BNB: number;
  MTRG: number;
  MOVR: number;
}

export const getCurrPrices = async () => {
  const res = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
    params: {
      ids: 'ethereum,meter,meter-stable,binancecoin,moonriver,avalanche-2',
      vs_currencies: 'usd,usd,usd,usd,usd,usd',
    },
  });

  return {
    ETH: res.data.ethereum.usd as number,
    MTR: res.data['meter-stable']['usd'] as number,
    BNB: res.data.binancecoin.usd as number,
    MTRG: res.data.meter.usd as number,
    MOVR: res.data.moonriver.usd as number,
    AVAX: res.data['avalanche-2']['usd'] as number,
  };
};

export const getBest = (url) => {
  return axios.get(`${url}/blocks/best`);
};

export const getCurrentDebts = () => {
  const debtsDir = path.join(__dirname, '..', '..', 'csv', 'debts');
  const totalPath = path.join(debtsDir, 'total.csv');
  const files = fs.readdirSync(debtsDir);
  let repaied = {};
  const totals = loadCSV(totalPath);

  // read total debts
  for (const t of totals) {
    const addr = t['address'].toLowerCase();
    const amount = t['amount'];
    if (!(addr in repaied)) {
      repaied[addr] = new BigNumber(0);
    }
    repaied[addr] = repaied[addr].plus(amount);
  }

  // minus repaied amount
  for (const f of files) {
    const date = new Date();
    const suffix = getSuffix(date);
    if (f.startsWith('repays-') && f.endsWith('.csv') && !f.startsWith(`repays-${suffix}`)) {
      const repays = loadCSV(path.join(debtsDir, f));
      for (const r of repays) {
        const addr = r['address'];
        const amount = r['amount'];
        if (addr in repaied) {
          repaied[addr] = repaied[addr].minus(amount);
        }
      }
    }
  }

  return repaied;
};
