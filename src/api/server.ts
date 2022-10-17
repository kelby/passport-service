require('../utils/validateEnv');

import { Logger } from 'pino';

import App from './app';
import { DepositController } from './controllers/deposit.controller';
import { HomeController } from './controllers/home.controller';
import { StatController } from './controllers/stat.controller';

export const serveAPI = async (port: number, rootLogger: Logger) => {
  const app = new App([
    new HomeController(rootLogger),
    new DepositController(rootLogger),
    new StatController(rootLogger),
  ]);
  await app.listen(port);
};
