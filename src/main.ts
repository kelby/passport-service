#!/usr/bin/env node
require('./utils/validateEnv');

import { disconnect } from 'mongoose';
import { Option } from 'commander';
import { serveAPI } from './api/server';
import { SyncCMD, RelayCMD } from './cmd';
import { Network } from './const';
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

const runRelay = async (options) => {
  if (!options.network) {
    throw new Error('please configure network');
  }
  console.log(`start to relay on network ${network}`);
  var network: Network;
  network = Network[options.network.toLowerCase()];
  const cmd = new RelayCMD(network);
  await connectDB();
  await cmd.start();
  await disconnect();
};

const runAPI = async (options) => {
  console.log(`start query api`);
  await serveAPI(options.port);
  await disconnect();
};

const parseNetwork = (value) => {
  try{
  const network = Network[value.toLowerCase()];
  return network
  }catch(e){
      throw new commander.InvalidArgumentError('Not a valid network');
  }
};

const parsePort = (value) => {
  try {
     let port = Number(value);
    if (port > 1000 && port < 65536) {
      return port;
    }
  } catch (e) {
    throw new commander.InvalidArgumentError('Not a valid port number');
  }
};

program.command('sync').addOption(
  new Option('-n, --network <network>', 'Network to use')
    .env('API_NETWORK')
    .argParser(parseNetwork)
    .makeOptionMandatory(true)
).action(runSync);

program.command('relay').addOption(
  new Option('-n, --network <network>', 'Network to use')
    .env('API_NETWORK')
    .argParser(parseNetwork)
    .makeOptionMandatory(true)
).action(runRelay);

program.command('api').addOption(
  new Option('-p, --port <port>', 'Port to listen').env('API_PORT').argParser(parsePort).makeOptionMandatory(true)
).action(runAPI);

(async () => {
  await program.parseAsync(process.argv);
})();
