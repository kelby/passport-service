#!/usr/bin/env node
require('./utils/validateEnv');

import pino from 'pino';

import { serveAPI } from './api/server';

const rootLogger = pino({
  transport: {
    target: 'pino-pretty',
  },
});

const parsePort = (value) => {
  try {
    let port = Number(value);
    if (port > 1000 && port < 65536) {
      return port;
    }
  } catch (e) {
    throw new Error('Not a valid port');
  }
};

(async () => {
  try {
    const port = parsePort(process.env.API_PORT);
    await serveAPI(port, rootLogger);
  } catch (e) {
    console.log('ERROR: ', e);
    process.exit(-1);
  }
})();
