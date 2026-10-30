# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

DVX CLI is a TypeScript-based command-line tool for image processing and asset optimization in frontend development. It provides utilities for image minification, format conversion, resizing, HTML validation, and CSS source map cleaning.

## Build & Development Commands

### Building the project

```bash
pnpm run build
```

This compiles TypeScript to JavaScript using SWC, outputs to `bin/` directory, and replaces import paths.

### Clean build artifacts

```bash
pnpm run build:clean
```

### Typechecking

```bash
pnpm run typecheck
```

SWC does not typecheck during build — run this before committing. CI runs it too.

### Running tests

```bash
pnpm run test        # Unit tests, then feature smoke tests over the built CLI (bin/)
pnpm run test:unit   # Run only unit tests
pnpm run test:features  # CLI smoke tests over bin/ - run pnpm run build first
make test            # Alternative using Makefile
```

### Running a single test file

```bash
node --import @swc-node/register/esm-register --test <file>
```

### Code formatting

```bash
# Project uses Biome for formatting and linting
# Configuration in biome.json
```

### Rebuilding native dependencies

```bash
pnpm run rebuild     # Rebuild native image processing binaries
```

### Dependency management

```bash
pnpm run package:update  # Update dependencies
make deps/update         # Comprehensive dependency update with deduplication
```

## Code Architecture

### Entry Point

- `src/index.ts` - CLI entry: configures yargs and auto-registers commands via `.commandDir()`
- `bin/index.js` - Built entry point for the CLI binary

### Command Structure

Commands are auto-discovered from `src/commands/` (recursively) using the pattern `*.command.ts`. Each command is a module-style yargs command exporting `command`, `description`, `builder`, and `handler`. Handlers must return/await their promise so yargs waits for completion.

Available command categories:

- **Images**: `img:minify`, `img:towebp`, `img:resize`, `img:optimize` (all support `--quality high|medium|low`)
- **HTML**: `html:validate` (using HTMLHint)
- **Files**: `files:clean-sourcemaps`

### Key Directories

- `src/commands/` - Command implementations organized by category
- `src/shared/domain/` - Pure utilities (file ops, worker queue, quality presets, formatting)
- `src/shared/infrastructure/` - Side-effectful services (logger)
- `tests/` - Test files using Node.js native test runner
- `docs/` - Troubleshooting (`troubleshooting-install.md`) and roadmap (`roadmap.md`)
- `bin/` - Compiled output directory

### Architecture Patterns

- Module-style yargs commands loaded with `.commandDir()`
- Worker-based processing for image operations: each helper (`image-minifier.ts`, `image-resizer.ts`, `image-webp-converter.ts`) calls `runQueue` from `src/shared/domain/workerQueue.ts`, which spawns one worker per core (minus one, never more than items) running a `*.job.ts` file that calls `serveQueue`. Items are handed out one at a time, largest first, and retried once if a worker dies. The result carries `processed`, `failed`, `lost`, `bytesIn` and `bytesOut`; image commands set exit code 1 when `failed + lost > 0`
- Quality presets shared across jobs in `src/shared/domain/quality-presets.ts`

### Testing Structure

- Uses Node.js native test runner (`node:test`)
- Test files follow `*.test.ts` pattern
- Tests use `node:assert/strict` for assertions
- `tests/fixtures/` - queue job stubs used by the worker queue tests
- `tests/features/` - CLI smoke tests over the built `bin/`

## Key Dependencies

### Runtime

- `yargs` - CLI argument parsing
- `imagemin` ecosystem - Image optimization
- `sharp` - Image processing (default resize tool)
- `pino` - Logging
- `htmlhint` - HTML validation

### Build

- `@swc/core` - TypeScript compilation
- `@swc/cli` - SWC command-line interface
- `@swc-node/register` - SWC Node.js loader for tests
- `replace-in-file` - Post-build path replacement

### CI

Lint, typecheck, test and build run in CI on Node 24 and 26.

## Development Notes

- Uses ES modules (`"type": "module"` in package.json)
- Import paths use `#/` prefix that gets replaced during build
- Node.js >=24 required (`engineStrict: true`)
- Package manager: pnpm >=12
- Build target: ESNext with SWC compiler
- Code formatting with Biome (configuration in biome.json)
- Native dependencies require periodic rebuilding (`pnpm run rebuild`)
- Logging goes through `src/shared/infrastructure/logger.ts` (never `console`; Biome forbids it in `src`). Env vars: `DVX_LOG_FORMAT=json`, `DVX_LOG_LEVEL`, `NO_COLOR`
- Make targets available for common tasks (test, dependency updates)
