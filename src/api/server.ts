require('../utils/validateEnv');

import App from './app';
import HomeController from './controllers/home.controller';

const app = new App([
  new HomeController(),
]);

export const serveAPI = async (port)=>{
  await app.listen(port);
}
