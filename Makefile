#!/bin/bash

# Libraries
TSC := node node_modules/.bin/tsc
ESLINT := node node_modules/.bin/eslint
CDK := node node_modules/.bin/cdk
pattern: pattern_name := $(firstword $(filter-out pattern, $(MAKECMDGOALS)))
pattern: pattern_command := $(subst pattern $(pattern_name), , $(MAKECMDGOALS))

pattern_files := $(notdir $(wildcard bin/*.ts))
formatted_pattern_names := $(patsubst %.ts,%,$(pattern_files))

# Dependecies
REQUIRED_LIBS :=  nvm node argocd

deps: bootstrap
	echo "Installing dependent packages from packages.json.."
	npm install

lint: 
	$(ESLINT) . --ext .js,.jsx,.ts,.tsx

lint-fix: 
	$(ESLINT) . --ext .js,.jsx,.ts,.tsx --fix

build:
	rm -rf dist && $(TSC) --skipLibCheck

compile:
	$(TSC) --build --incremental 

list: 
	@$ echo "To work with patterns use:"
	@$ echo "	$$ make pattern <pattern-name> <list | deploy | synth | destroy>"
	@$ echo "Example:"
	@$ echo "	$$ make pattern single-new-eks-awsnative-observability list"
	@$ echo
	@$ echo "Patterns: "
	@$ $(foreach pattern, $(formatted_pattern_names),  echo "$(pattern)";)

mkdocs:
	mkdocs serve 

pattern:
	@echo $(pattern_name) performing $(pattern_command)
	$(CDK) --app "npx ts-node bin/$(pattern_name).ts" $(if $(pattern_command),$(pattern_command), list)

test-all:
	@for pattern in $(formatted_pattern_names) ; do \
		echo "Building pattern $$pattern"; \
		$(CDK) --app "npx ts-node bin/$$pattern.ts" list || exit 1 ;\
    done 

bootstrap:
	@for LIB in $(REQUIRED_LIBS) ; do \
		LIB=$$LIB make check-libs ; \
		echo "----------" ; \
    done; \
	make install-n; \
	echo "----------" ;

check-libs:
ifeq ($(shell uname -s),Darwin)
	@if ! test -n "$$(brew ls --versions $(LIB))"; then \
		echo Installing $(LIB) via Hombrew; \
		brew install $(LIB); \
	else \
		echo $(LIB) is already installed, skipping..; \
	fi
else ifeq ($(shell uname -s),Linux)
	@if test $(LIB) = "nvm"; then \
		if ! test -f ~/.nvm/nvm.sh; then \
			echo Installing $(LIB)..; \
			curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash; \
		else \
			echo $(LIB) is already installed, skipping..; \
		fi; \
	elif test $(LIB) = "node"; then \
		. ~/.nvm/nvm.sh; \
		if test $$(grep -Ec "PRETTY_NAME=\"Amazon Linux 2\"" /etc/os-release) -ge 1; then \
			nvm install 16; \
		else \
			nvm install 18; \
		fi; \
	elif test $(LIB) = "argocd"; then \
		if ! test -x /usr/local/bin/argocd; then \
			echo Installing $(LIB)..; \
			curl -sSL -o argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64; \
			sudo install -m 555 argocd-linux-amd64 /usr/local/bin/argocd; \
			rm argocd-linux-amd64; \
		else \
			echo $(LIB) is already installed, skipping..; \
		fi; \
	else \
		echo Unkonwn lib $(LIB), skipping..; \
	fi
else 
	echo "Unknown operating system"
endif

install-n:
ifeq ($(shell uname -s),Darwin)
	@sudo npm install -g n; \
	sudo n 18;
else ifeq ($(shell uname -s),Linux)
	@. ~/.nvm/nvm.sh; \
	npm_path=$$(dirname `which npm`); \
	$${npm_path}/npm install -g n; \
	if test $$(grep -Ec "PRETTY_NAME=\"Amazon Linux 2\"" /etc/os-release) -ge 1; then \
		sudo $${npm_path}/n 16; \
	else \
		sudo $${npm_path}/n 18; \
	fi;
endif