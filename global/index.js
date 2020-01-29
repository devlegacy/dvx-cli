const { consoles } = require('../helpers');

global.log = consoles.log;
global.warn = consoles.warn;
global.error = consoles.error;
global.flog = consoles.flog;

global.notifier = require('node-notifier');
global.path = require('path');
global.File = require('../lib/File');
global.Notify = require('../lib/Notify');
