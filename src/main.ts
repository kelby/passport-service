#!/usr/bin/env node
import { BalanceCMD } from './cmd/balance';

require('./utils/validateEnv');

import { Option } from 'commander';
import { disconnect } from 'mongoose';
import pino from 'pino';

import { serveAPI } from './api/server';
import { RelayCMD, SyncCMD } from './cmd';
import { Network } from './const';
import { connectDB } from './utils/db';

const commander = require('commander');
const program = new commander.Command();

const rootLogger = pino({
  transport: {
    target: 'pino-pretty',
  },
});

const runSync = async (options) => {
  if (!options.network) {
    throw new Error('please configure network');
  }
  console.log(`start to sync on network ${network}`);
  var network: Network;
  network = Network[options.network.toLowerCase()];
  const cmd = new SyncCMD(network, rootLogger);
  await connectDB();
  await cmd.start();
  await disconnect();
};

const runRelay = async (options) => {
  const cmd = new RelayCMD(rootLogger);
  await connectDB();
  await cmd.start();
  await disconnect();
};

const runBalance = async (options) => {
  const cmd = new BalanceCMD(rootLogger);
  await connectDB();
  await cmd.start();
  await disconnect();
};

const runAPI = async (options) => {
  console.log(`start query api`);
  await serveAPI(options.port, rootLogger);
  // await disconnect();
};

const parseNetwork = (value) => {
  try {
    const network = Network[value.toLowerCase()];
    return network;
  } catch (e) {
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

program
  .command('sync')
  .addOption(
    new Option('-n, --network <network>', 'Network to use')
      .env('API_NETWORK')
      .argParser(parseNetwork)
      .makeOptionMandatory(true)
  )
  .action(runSync);

program.command('relay').action(runRelay);
program.command('balance').action(runBalance);

program
  .command('api')
  .addOption(
    new Option('-p, --port <port>', 'Port to listen').env('API_PORT').argParser(parsePort).makeOptionMandatory(true)
  )
  .action(runAPI);

(async () => {
  await program.parseAsync(process.argv);
})();
