import axios from 'axios';

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



