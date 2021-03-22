# Notes

```sh
  # Local test command:
  npm link
```

- Add permission: `chmod +x ./cli.js`
- Move: `mv ./cli.js /usr/bin/`
- where is?: `where dvx`
- Size on end: `du -sh ./src/img/src/`
- [Read more on stackoverflow:](https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js "stackoverflow")

## Console name

```sh
   ____                      _                          ____ _     ___
  |  _ \  _____   _______  _| |_ ___  __ _ _ __ ___    / ___| |   |_ _|
  | | | |/ _ \ \ / / _ \ \/ / __/ _ \/ _` | '_ ` _ \  | |   | |    | |
  | |_| |  __/\ V /  __/>  <| ||  __/ (_| | | | | | | | |___| |___ | |
  |____/ \___| \_/ \___/_/\_\\__\___|\__,_|_| |_| |_|  \____|_____|___|
  # http://patorjk.com/software/taag/#p=testall&f=3D%20Diagonal&t=Devexteam%20CLI
  # Font Name: Standard
```

## Node environment

```js
/*
 * [0] Reserved by Node.js
 * [1] Reserved by Node.js
 */
 process.argv[3] = 'Estamos aprendiendo Node.JS';
 process.argv[4] = 19;
 process.argv[5] = null;
 process.argv[6] = true;

 c('----------------------------------------');
 c('        PROCESOS DE NODE.JS             ');
 c(`ID del proceso............${process.pid}`);
 c(`Título....................${process.title}`);
 c(`Directorio de Node.JS.....${process.execPath}`);
 c(`Directorio actual.........${process.cwd()}`);
 c(`Versión de Node.JS........${process.version}`);
 c(`Versiones de dependencias.${process.versions}`);
 c(`Plataforma (S.O.).........${process.platform}`);
 c(`Arquitectura (S.O.).......${process.arch}`);
 c(`Tiempo activo de Node.JS..${process.uptime()}`);
 c(`Argumento de procesos.....${process.argv}`);
 c('----------------------------------------');

 for(let i in process.argv){
   c(`[${i}] - ${process.argv[i]}`);
 }


c(__dirname);
c(__filename);
c(process);
c(process.cwd());
c(process.argv);
c(process.argv0);
```

## Examples TS with yargs

```ts
#!/usr/bin/env node

import yargs, { Argv } from 'yargs';

let argv = yargs
    .command('serve', "Start the server.", (yargs: Argv) => {
        return yargs.option('port', {
            describe: "Port to bind on",
            default: "5000",
        }).option('verbose', {
            alias: 'v',
            default: false,
        })
    }).argv;

if (argv.verbose) {
    console.info("Verbose mode on.");
}

serve(argv.port);

function serve(port: string) {
    console.info(`Serve on port ${port}.`);
}
```

```ts
#!/usr/bin/env node
import yargs, { Argv } from 'yargs';

const argv = yargs(process.argv.slice(2)).options({
  a: { type: 'boolean', default: false },
  b: { type: 'string', demandOption: true },
  c: { type: 'number', alias: 'chill' },
  d: { type: 'array' },
  e: { type: 'count' },
  f: { choices: ['1', '2', '3'] }
}).argv;
```

```ts
#!/usr/bin/env node
import yargs, { Argv } from 'yargs';
interface Arguments {
    [x: string]: unknown;
    a: boolean;
    b: string;
    c: number | undefined;
    d: (string | number)[] | undefined;
    e: number;
    f: string | undefined;
  }
const argv:Arguments = yargs(process.argv.slice(2)).options({
  a: { type: 'boolean', default: false },
  b: { type: 'string', demandOption: true },
  c: { type: 'number', alias: 'chill' },
  d: { type: 'array' },
  e: { type: 'count' },
  f: { choices: ['1', '2', '3'] }
}).argv;
```

```ts
#!/usr/bin/env node
import yargs, { Argv } from 'yargs';

type Difficulty = 'normal' | 'nightmare' | 'hell';
const difficulties: ReadonlyArray<Difficulty> = ['normal', 'nightmare', 'hell'];

const argv = yargs.option('difficulty', {
  choices: difficulties,
  demandOption: true
}).argv;
```
