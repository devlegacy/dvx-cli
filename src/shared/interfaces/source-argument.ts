import { Arguments } from 'yargs';

export default interface SourceArgument extends Arguments {
  source: string;
  src?: string;
  s?: string;
}
