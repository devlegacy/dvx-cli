import { Arguments } from 'yargs';

export default interface DistributionArgument extends Arguments {
  distribution: string;
  dist?: string;
  d?: string;
}
