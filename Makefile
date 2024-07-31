MAKEFLAGS += -s

current_work_directory := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

export current_work_directory

include ./.bin/colors

print_message:=./.bin/print_message

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
	$(print_message) "updating dependencies"
	ncu -u && ncu --target minor -u && ncu --target patch -u
	corepack up
	NODE_ENV= pnpm install
	NODE_ENV= pnpm audit --fix

.PHONY: test
.SILENT: test
test: ## 🧪 Run project tests.
	$(print_message) "running tests"
	NODE_ENV=test
# DEBT: this prints the error message to the console, but it doesn't stop the execution of the script, we'll wait node 23.x
	if ! node --run test ; then
		pnpm run test
	fi
