import { cwd, uptime } from 'node:process'

import type { ArgumentsCamelCase, InferredOptionTypes } from 'yargs'

import { error, log } from '#/src/shared/domain/console.js'
import { File } from '#/src/shared/domain/file.js'
import config from '#/src/shared/infrastructure/config.js'

export const command = 'files:clean-sourcemaps'
export const description = 'Clean sourcemaps'
export const builder = {
  source: {
    alias: 'src',
    describe: 'Source path of the files.',
    type: 'string',
    default: './node_modules/',
  },
  packages: {
    alias: 'pkg',
    describe: 'List of npm packages with CSS files to clean.',
    type: 'array',
    default: ['bootstrap-datepicker', 'tinymce'],
  },
} as const
export const handler = (args: ArgumentsCamelCase<InferredOptionTypes<typeof builder>>) => {
  const commandStartedAt = uptime()
  const packageJson = getPackageJson()

  // https://github.com/npm/validate-npm-package-name
  const packages = args.packages.map((_) => _.toString().trim()) // sanitize
  const { source } = args

  const ensurePackages = [
    ...Object.keys(packageJson?.dependencies ?? {}),
    ...Object.keys(packageJson?.devDependencies ?? {}),
  ].some((dependencies) => packages.indexOf(dependencies) >= 0)

  if (!ensurePackages) {
    error(`[${command}]:`, 'Dependencies not found')
    return
  }

  const directories = packages
    .map((pkg) => getDirectory(source, pkg))
    .filter((file) => file.isDirectory())
  const files = directories.reduce(
    (files: File[], { info: { absolutePath } }) =>
      files.concat(...File.sync('**/*.css', { cwd: absolutePath }).map((file) => File.find(file))),
    [],
  )

  const regexp = config.CSS_SOURCEMAP_REGEX
  for (const file of files) {
    const data = file.read()
    const replaced = data.replace(regexp, '')
    file.write(replaced)
    log('[File]:', file.info.path)
  }
  const commandFinishedAt = uptime()
  const commandElapsedTime = commandFinishedAt - commandStartedAt

  log(`[${command}]:`, `${commandElapsedTime.toFixed(3)}s`)
}

const getPackageJson = (): {
  devDependencies: Record<string, string>
  dependencies: Record<string, string>
} => {
  const filename = 'package.json'
  const file = File.find(filename)
  if (!file.info.isFile) {
    throw new Error(
      `The file <${filename}> does not exist in the root directory of the project located at <${cwd()}>. Please ensure that the file is present and try again.`,
    )
  }

  try {
    const json = JSON.parse(file.read())
    return json
  } catch (error) {
    throw new Error(
      `Error parsing the file <${filename}> in the root directory of the project located at <${cwd()}>`,
    )
  }
}

const getDirectory = (source: string, pkg: string): File => {
  const dir = File.find(`${source}/${pkg}/`)
  if (!dir.info.isDir) {
    throw new Error(`The directory of the package <${pkg}> was not found`)
  }
  return dir
}
