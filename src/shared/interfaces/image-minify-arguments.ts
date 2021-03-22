import DistributionArgument from './distribution-argument';
import SourceArgument from './source-argument';

export default interface ImageMinifyArguments
  extends SourceArgument,
    DistributionArgument {}
