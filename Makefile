SHELL:=$(shell which bash)
MAKEFLAGS += -s

current_work_directory := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

export current_work_directory

include ./.etc/bin/colors

print_message:=./.etc/bin/print_message

.DEFAULT_GOAL := help

.ONESHELL:

.PHONY: help
.SILENT: help
help: ## 📋 Display help message with descriptions of all available commands.
	echo "Recommended usage: make [target]"
	echo ""
	echo "Targets:"
	grep -E '^[a-zA-Z0-9\/_ -]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "} {gsub(/^[^:]*:/, ""); gsub(/^ +| +$$/, "", $$1); printf "'${COLOR_GREEN}'%-10s'${COLOR_RESET}' : %s\n", $$1, $$2}'

.PHONY: deps/update
.SILENT: deps/update
deps/update: ## ⬆️ Update all project dependencies to their latest versions.
	set -eo pipefail
	$(print_message) "bump dependencies"
	PNPM_QUIET_FLAGS="--config.loglevel=error"
	NODE_ENV= pnpm audit || true
	find . -type d -name node_modules -not -path '*/.git/*' -prune -exec rm -rf '{}' +
	rm -f pnpm-lock.yaml
	CI=true corepack use pnpm@latest-11
	if command -v ncu &>/dev/null; then
		NCU_CMD=ncu
	elif [ -f ./node_modules/.bin/ncu ]; then
		NCU_CMD=./node_modules/.bin/ncu
	else
		echo "ncu (npm-check-updates) not found. Install with one of:"
		echo "  npm i -g npm-check-updates"
		echo "  pnpm add -g npm-check-updates"
		echo "  pnpm add -O npm-check-updates   # optional/local"
		exit 1
	fi
	$$NCU_CMD --target patch -u && $$NCU_CMD --target minor -u && $$NCU_CMD -u
	NODE_ENV= pnpm install --no-frozen-lockfile $$PNPM_QUIET_FLAGS
	NODE_ENV= pnpm up --recursive $$PNPM_QUIET_FLAGS
	NODE_ENV= pnpm audit --fix=update $$PNPM_QUIET_FLAGS
	NODE_ENV= pnpm dedupe $$PNPM_QUIET_FLAGS
	NODE_ENV= pnpm rebuild @swc-node/register @swc/cli @swc/core sharp
	NODE_ENV= pnpm audit --ignore-unfixable

.PHONY: test
.SILENT: test
test: ## 🧪 Run project tests.
	$(print_message) "running tests"
	NODE_ENV=test
# DEBT: this prints the error message to the console, but it doesn't stop the execution of the script, we'll wait node 23.x
	if ! node --run test ; then
		pnpm run test
	fi
