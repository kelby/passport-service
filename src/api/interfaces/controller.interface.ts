import { Router } from 'express';
import { Logger } from 'pino';

interface Controller {
  path: string;
  router: Router;
  log: Logger;
}

export default Controller;
