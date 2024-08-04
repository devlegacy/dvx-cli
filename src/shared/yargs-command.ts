import type { ArgumentsCamelCase, InferredOptionTypes, Options } from 'yargs'

export abstract class YargsCommand {
  abstract readonly command: string
  abstract readonly description: string
  abstract readonly builder: Record<string, Options>

  protected options<O extends Record<string, Options>>(options: O): O {
    return options
  }

  abstract handler(args: ArgumentsCamelCase<InferredOptionTypes<typeof this.builder>>): void
}
