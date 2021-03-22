import { Arguments } from 'yargs';
import SourceArgument from './source-argument';

export default interface ImageResizeArguments extends SourceArgument {
  width: number;
  w?: number;
  height?: number;
  h?: number;
  tool: string;
  exclude: Array<string>;
  exc?: Array<string>;
}
