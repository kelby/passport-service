require('../utils/validateEnv');

import { Logger } from 'pino';

import App from './app';
import { HomeController } from './controllers/home.controller';

export const serveAPI = async (port: number, rootLogger: Logger) => {
  const app = new App([new HomeController(rootLogger)]);
  await app.listen(port);
};
