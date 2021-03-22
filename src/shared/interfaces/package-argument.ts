import { Arguments } from 'yargs';

export default interface PackageArgument extends Arguments {
  packages: Array<string>;
  pkg?: Array<string>;
}
