#!/usr/bin/env node
require('./utils/usage');
require('./utils/validateEnv');

// other imports
import * as Logger from 'bunyan';
import mongoose from 'mongoose';

import * as pkg from '../package.json';
import { CMD, SyncCMD } from './cmd';
import { Network } from './const';
import { snakeToCamel, upperFirst } from './utils';
import { connectDB } from './utils/db';
import { printUsage } from './utils/usage';

const log = Logger.createLogger({ name: 'main' });
delete log.fields.hostname;
delete log.fields.pid;

const netStr = process.argv[2];
const netName = upperFirst(snakeToCamel(netStr));
const network = Network[netName];

let cmd: CMD;
switch (process.argv[3]) {
  case 'sync':
    cmd = new SyncCMD(network);
    break;

  default:
    printUsage('invalid cmd name');
}

(async () => {
  // const blockQueue = new BlockQueue('block');
  let shutdown = false;

  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  signals.forEach((sig) => {
    process.on(sig, async (s) => {
      process.stdout.write(`Got signal: ${s}, terminating...\n`);
      if (!shutdown) {
        shutdown = true;
        await mongoose.disconnect();
        await cmd.stop();
        process.exit(0);
      }
    });
  });

  try {
    log.info({ version: pkg.version, cmd: process.argv[3], network: process.argv[2] }, 'start cmd');
    await connectDB();
    await cmd.start();
    mongoose.disconnect();
  } catch (e) {
    console.log(`start error: ${e.name} ${e.message} - ${e.stack}`);
    process.exit(-1);
  }
})();
