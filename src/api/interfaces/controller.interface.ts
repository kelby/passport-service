import { RequestHandler, Router } from 'express';
import { Logger } from 'pino';

export interface Controller {
  path: string;
  router: Router;
  log: Logger;
}

export function try$(handler: RequestHandler): RequestHandler {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}
