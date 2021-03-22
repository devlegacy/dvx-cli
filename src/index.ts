#!/usr/bin/env node

import { Argv } from 'yargs';
import { DvxCLI } from './dvx-cli';
import { log } from './helpers/console';

const dvxCLI = new DvxCLI();
const yargs: Argv = dvxCLI.yargs;
const argv = yargs.argv;
const command = argv._[0];

// log(argv);
// log(command);

// yargs.showHelp();