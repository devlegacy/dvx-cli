#!/usr/bin/env node

require('../global');

const dvxCLI = require('./config');
const yargs = dvxCLI.getYargs();
const argv = yargs.argv;
const command = argv._[0];

if (command in dvxCLI.cmd) {
  dvxCLI.cmd[command](argv);
} else {
  yargs.showHelp();
}
