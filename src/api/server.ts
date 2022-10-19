require('../utils/validateEnv');

import { Logger } from 'pino';

import App from './app';
import { HomeController } from './controllers/home.controller';
import { StatController } from './controllers/stat.controller';
import { TransferController } from './controllers/transfer.controller';

export const serveAPI = async (port: number, rootLogger: Logger) => {
  const app = new App([
    new HomeController(rootLogger),
    new TransferController(rootLogger),
    new StatController(rootLogger),
  ]);
  await app.listen(port);
};
