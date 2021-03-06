.PHONY: all \
help npmi clean

-include Makefile.env

ROOT_PATH=$(PWD)
SRC_PATH=$(ROOT_PATH)/src
BIN:=$(ROOT_PATH)/node_modules/.bin
ESLINT=$(BIN)/eslint
JEST=$(BIN)/jest

APP_NAME?=cdk-ts-boiler
APP_ENVIRONMENT?=dev
AWS_REGION?=us-east-1
AWS_OPTIONS=

STACK_NAME?=CdkTsBoilerStack
LAMBDA_EVENT?=events/event.json
LAMBDA_ENV?=.env.local.json

ifdef AWS_PROFILE
AWS_OPTIONS=--profile $(AWS_PROFILE)
endif

define ENV_LOCAL_JSON
{
  "GetStatus": {
    "EVENT_BUS_NAME": "test"
  }
}
endef
export ENV_LOCAL_JSON

define EVENT_LOCAL_JSON
{
    "httpMethod": "POST",
    "body": "{\"id\": \"id1\",\"name\": \"name1\"}"
}
endef
export EVENT_LOCAL_JSON


all: lint unit

# test: lint coverage ## Run code linter, unit tests and code coverage report
test: unit ## Run unit tests and code coverage report

help: ## Describe all available commands
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

clean: ## Delete local artifacts
	rm -rf coverage

npmi: ## Install npm dependencies
	npm i

arm64: ## Enable local Linux OS ARM64 support
	docker run --rm --privileged multiarch/qemu-user-static --reset -p yes

local-init: ## Generate initial local dev support files 
	@if [ ! -f ./Makefile.env ]; then \
		echo "AWS_PROFILE=default\nLAMBDA_NAME=StatusGet\nLAMBDA_EVENT=events/event.json\nTEST_NAME=test" > ./Makefile.env; \
	fi

	@if [ ! -f $(LAMBDA_ENV) ]; then \
		echo "$$ENV_LOCAL_JSON" > $(LAMBDA_ENV); \
	fi

	@if [ ! -d ./events ]; then \
		mkdir ./events && echo "$$EVENT_LOCAL_JSON" > ./events/event.json; \
	fi

lint: ## Run code linter
	@echo "Linting code..."
	@$(ESLINT) --quiet --ext .js,.ts $(SRC_PATH)
	@echo "Linting PASSED"

unit: ## Run unit tests
	@echo "Running unit tests..."
	@$(JEST)

coverage: ## Run unit tests & coverage report
	@echo "Running unit tests and coverage..."
	@$(JEST) --coverage

test-single: ## Run unit tests
	@echo "Running single unit test/suite..."
	@$(JEST) --coverage=false -t $(TEST_NAME)

invoke: build ## Invoke individual Lambda
	sam local invoke $(LAMBDA_NAME) $(SAM_PARAMS) -t ./cdk.out/$(STACK_NAME).template.json --event $(LAMBDA_EVENT) --env-vars $(LAMBDA_ENV) $(AWS_OPTIONS)

invoke-out: ## Invoke individual Lambda & pipe logs to file 
	make invoke > invoke.out 2>&1

build: ## Build CDK app using local code
	cdk synth --no-staging

deploy: ## Deploy CDK app using local build
	cdk deploy --require-approval never --verbose
