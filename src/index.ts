#!/usr/bin/env node

import { argv } from 'node:process'
import { DvxCLI } from './dvx.js'

await new DvxCLI(argv).parse()
