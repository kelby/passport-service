#!/usr/bin/env node
require('./utils/validateEnv');

import { disconnect } from 'mongoose';

import { SyncCMD } from './cmd';
import { Network } from './const';
import { snakeToCamel, upperFirst } from './utils';
import { connectDB } from './utils/db';

const commander = require('commander');
const program = new commander.Command();

const runSync = async (options) => {
  if (!options.network) {
    throw new Error('please configure network');
  }
  console.log(`start to sync on network ${network}`);
  var network: Network;
  network = Network[options.network.toLowerCase()];
  const cmd = new SyncCMD(network);
  await connectDB();
  await cmd.start();
  await disconnect();
};

program.command('sync').option('-n, --network <network>', 'Network to use').action(runSync);

(async () => {
  await program.parseAsync(process.argv);
})();
