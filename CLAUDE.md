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
pnpm run test        # Run all tests (unit + features)
pnpm run test:unit   # Run only unit tests
make test            # Alternative using Makefile
```

### Running a single test file

```bash
node --import @swc-node/register/esm-register --test tests/lib/file.test.ts
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
- `src/shared/domain/` - Pure utilities (file ops, worker runner, quality presets, formatting)
- `src/shared/infrastructure/` - Side-effectful services (logger, notifications, config)
- `tests/` - Test files using Node.js native test runner
- `bin/` - Compiled output directory

### Architecture Patterns

- Module-style yargs commands loaded with `.commandDir()`
- Worker-based processing for image operations: helper (`image-minifier.ts`) chunks files per CPU and spawns a `*.job.ts` worker per chunk via `runWorker`; workers post `WorkerResult` (`processed`, `endTime`, optional `bytesIn`/`bytesOut`)
- Quality presets shared across jobs in `src/shared/domain/quality-presets.ts`

### Testing Structure

- Uses Node.js native test runner (`node:test`)
- Test files follow `*.test.ts` pattern
- Tests use `node:assert/strict` for assertions
- Test stubs in `tests/stubs/` directory

## Key Dependencies

### Runtime

- `yargs` - CLI argument parsing
- `imagemin` ecosystem - Image optimization
- `sharp` - Image processing fallback
- `htmlhint` - HTML validation

### Build

- `@swc/core` - TypeScript compilation
- `@swc/cli` - SWC command-line interface
- `@swc-node/register` - SWC Node.js loader for tests
- `replace-in-file` - Post-build path replacement

## Development Notes

- Uses ES modules (`"type": "module"` in package.json)
- Import paths use `#/` prefix that gets replaced during build
- Node.js >=24 required (`engineStrict: true`)
- Package manager: pnpm >=11
- Build target: ESNext with SWC compiler
- Code formatting with Biome (configuration in biome.json)
- Native dependencies require periodic rebuilding (`pnpm run rebuild`)
- Make targets available for common tasks (test, dependency updates)
