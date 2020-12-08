# Notes

```sh
  # Local test command:
  npm link
```

- Add permission: `chmod +x ./cli.js`
- Move: `mv ./cli.js /usr/bin/`
- where is?: `where dvx`
- [Read more on stackoverflow:](https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js)

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
