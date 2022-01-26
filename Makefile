.PHONY: all \
help npmi clean \
test test-single lint coverage unit \
local-init invoke api \
sam-install sam-clean sam-build sam-package \
install pre-build build post-build es-build

-include Makefile.env

ROOT_PATH=$(PWD)
SRC_PATH=$(ROOT_PATH)/src
BUILD_PATH=$(ROOT_PATH)/.aws-sam/build
BIN:=$(ROOT_PATH)/node_modules/.bin
ESLINT=$(BIN)/eslint
ESBUILD=$(BIN)/esbuild
JEST=$(BIN)/jest

APP_NAME?=cdk-ts-boiler
SAM_ARTIFACT_BUCKET?=lambdadeploys
APP_ENVIRONMENT?=dev
AWS_REGION?=us-east-1
AWS_OPTIONS=

SAM_PARAMS=--parameter-overrides ParameterKey=Environment,ParameterValue=$(APP_ENVIRONMENT)
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


all: validate unit

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
	@$(ESLINT) --quiet --ext .js $(SRC_PATH)
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

validate: ## Validate SAM template
	sam validate

invoke: sam-clean es-build ## Invoke individual Lambda
	sam local invoke $(LAMBDA_NAME) $(SAM_PARAMS) --event $(LAMBDA_EVENT) --env-vars $(LAMBDA_ENV) $(AWS_OPTIONS)

invoke-out: ## Invoke individual Lambda & pipe logs to file 
	make invoke > invoke.out 2>&1

api: sam-clean ## Start the API GW locally
	sam local start-api $(SAM_PARAMS) --env-vars $(LAMBDA_ENV) $(AWS_OPTIONS)

deploy: es-build sam-package sam-deploy ## Deploy SAM app using local code

sam-install: # CICD only
	pip install --upgrade pip
	pip install aws-sam-cli

sam-clean: ## Delete local artifacts
	rm -rf .aws-sam

sam-build:
	sam build $(SAM_PARAMS)

sam-package:
	sam package \
	--template-file template.yaml \
	--s3-bucket $(SAM_ARTIFACT_BUCKET) \
	--output-template-file packaged.yaml \
	$(AWS_OPTIONS)

sam-deploy: 
	sam deploy \
	--template-file packaged.yaml \
	--stack-name $(APP_NAME) \
	--capabilities CAPABILITY_NAMED_IAM \
	$(SAM_PARAMS) $(AWS_OPTIONS)

es-build: 
	npx esbuild \
		--bundle $(SRC_PATH)/handlers/*/index.ts \
		--outdir=dist \
		--outbase=$(SRC_PATH) \
		--sourcemap=inline \
		--platform=node

install: sam-install npmi # Optional rule intended for use in the CICD environment
	@echo INSTALL phase completed `date`

pre-build: test # Optional rule intended for use in the CICD environment
	@echo PRE_BUILD phase completed `date`

build: sam-build sam-package # Optional rule intended for use in the CICD environment
	@echo BUILD phase completed `date`

post-build: sam-deploy # Optional rule intended for use in the CICD environment
	@echo POST_BUILD phase completed `date`
