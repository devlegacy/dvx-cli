import { Argv } from 'yargs';

export interface Command {
  command: string;
  description: string;
  options: any;
  handler: (yargs: Argv) => void;
}

export interface CommandVersion {
  optionKey: string;
  description: string;
  version: string;

  build: [string, string, string];
}
