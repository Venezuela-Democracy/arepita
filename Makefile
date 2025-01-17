# Variables
GIT_SHA := $(shell git rev-parse --short=7 HEAD)
PROJECT_ID := spanish-catalyst
REGION := us-central1
SERVICE_NAME := telegram-bot

# Colores
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[1;33m
RESET := \033[0m

# Comandos básicos
setup:
	@echo "$(BLUE)🔧 Installing dependencies...$(RESET)"
	@npm install

clean:
	@echo "$(BLUE)🧹 Cleaning build files...$(RESET)"
	@rm -rf dist
	@rm -rf build

build: clean
	@echo "$(BLUE)🏗️  Building project...$(RESET)"
	@npm run build

dev: build
	@echo "$(BLUE)🚀 Running in development mode...$(RESET)"
	@npm run dev

# Comandos de Docker
docker-build:
	@echo "$(BLUE)🐳 Building Docker image...$(RESET)"
	@docker build -t $(SERVICE_NAME):$(GIT_SHA) .

docker-run: docker-build
	@echo "$(BLUE)🐳 Running Docker container locally...$(RESET)"
	@docker run --env-file .env -p 8080:8080 $(SERVICE_NAME):$(GIT_SHA)

# Comandos de Cloud Run
deploy: build check-env
	@echo "$(BLUE)🚀 Deploying to Cloud Run...$(RESET)"
	@docker buildx build --platform linux/amd64 \
		-t gcr.io/$(PROJECT_ID)/$(SERVICE_NAME):$(GIT_SHA) . --push

	@echo "$(BLUE)📦 Updating secrets...$(RESET)"
	@gcloud secrets versions add $(SERVICE_NAME)-env \
		--data-file .env \
		|| gcloud secrets create $(SERVICE_NAME)-env \
		--data-file .env

	@echo "$(BLUE)🚀 Deploying service...$(RESET)"
	@gcloud run deploy $(SERVICE_NAME) \
		--image gcr.io/$(PROJECT_ID)/$(SERVICE_NAME):$(GIT_SHA) \
		--region $(REGION) \
		--update-env-vars "$$(gcloud secrets versions access latest --secret $(SERVICE_NAME)-env | tr '\n' ',')" \
		--allow-unauthenticated \
		--memory 2Gi \
		--cpu 2 \
		--min-instances 1 \
		--max-instances 1 \
		--concurrency 80

	@echo "$(GREEN)✅ Deployment successful$(RESET)"
	@make set-webhook

# Comandos de Webhook
check-env:
	@echo "$(BLUE)🔍 Checking environment variables...$(RESET)"
	@if [ ! -f .env ]; then \
		echo "$(RED)❌ Error: .env file not found$(RESET)"; \
		exit 1; \
	fi
	@if ! grep -q "BOT_TOKEN=" .env; then \
		echo "$(RED)❌ Error: BOT_TOKEN not found in .env$(RESET)"; \
		exit 1; \
	fi
	@if ! grep -q "WEBHOOK_SECRET=" .env; then \
		echo "$(RED)❌ Error: WEBHOOK_SECRET not found in .env$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)✅ Environment variables OK$(RESET)"

get-url:
	@echo "$(BLUE)🔍 Getting Cloud Run URL...$(RESET)"
	@url=$$(gcloud run services describe $(SERVICE_NAME) --region $(REGION) --format 'value(status.url)'); \
	echo "$$url" > .url; \
	echo "$(GREEN)✅ Service URL: $$url$(RESET)"

set-webhook: get-url
	@echo "$(BLUE)🔗 Setting up Telegram webhook...$(RESET)"
	@url=$$(cat .url); \
	bot_token=$$(grep BOT_TOKEN .env | cut -d '=' -f2); \
	webhook_secret=$$(grep WEBHOOK_SECRET .env | cut -d '=' -f2); \
	response=$$(curl -s -X POST \
		-H "Content-Type: application/json" \
		-d "{\"url\":\"$$url/api/telegram/webhook\", \"secret_token\":\"$$webhook_secret\"}" \
		"https://api.telegram.org/bot$$bot_token/setWebhook"); \
	if echo "$$response" | grep -q '"ok":true'; then \
		echo "$(GREEN)✅ Webhook configured successfully$(RESET)"; \
	else \
		echo "$(RED)❌ Error configuring webhook:$(RESET)"; \
		echo "$$response"; \
		exit 1; \
	fi

delete-webhook:
	@echo "$(BLUE)🔗 Deleting Telegram webhook...$(RESET)"
	@bot_token=$$(grep BOT_TOKEN .env | cut -d '=' -f2); \
	curl -s -X POST "https://api.telegram.org/bot$$bot_token/deleteWebhook"; \
	echo "$(GREEN)✅ Webhook deleted$(RESET)"

destroy:
	@echo "$(BLUE)🗑️  Destroying Cloud Run service...$(RESET)"
	@make delete-webhook || true
	@gcloud run services delete $(SERVICE_NAME) --region $(REGION) --quiet || true
	@gcloud secrets delete $(SERVICE_NAME)-env --quiet || true
	@echo "$(GREEN)✅ Service destroyed$(RESET)"

# Comandos principales
init: setup deploy

.PHONY: setup clean build dev docker-build docker-run deploy check-env get-url set-webhook delete-webhook destroy init