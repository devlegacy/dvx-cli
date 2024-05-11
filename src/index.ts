#!/usr/bin/env node

import { argv } from 'node:process'
import { DvxCLI } from './dvx.js'

await (await new DvxCLI(argv).installCommands()).parse()
