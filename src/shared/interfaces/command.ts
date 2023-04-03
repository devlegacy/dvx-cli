import { Argv, Options } from 'yargs';

export interface Command {
  command: string;
  description: string;
  options: { [key: string]: Options };
  handler: (yargs: Argv) => void;
}
