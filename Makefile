# Variables
ENV_FILE := .env
SRC_DIR := src
RAILWAY := railway

# Colores
BLUE := \033[34m
GREEN := \033[32m
RED := \033[31m
RESET := \033[0m

.PHONY: help telegram-setup telegram-dev telegram-deploy telegram-webhook

# Target por defecto
.DEFAULT_GOAL := help


help:
	@echo "$(BLUE)Comandos disponibles:$(RESET)"
	@echo "  $(GREEN)make telegram-all$(RESET)      - Ejecuta todo el proceso de deployment"
	@echo "  $(GREEN)make telegram-setup$(RESET)    - Configura el bot de Telegram"
	@echo "  $(GREEN)make telegram-env$(RESET)      - Configura variables en Railway"
	@echo "  $(GREEN)make telegram-dev$(RESET)      - Inicia el bot en desarrollo"
	@echo "  $(GREEN)make telegram-deploy$(RESET)   - Despliega el bot a Railway"
	@echo "  $(GREEN)make telegram-webhook$(RESET)  - Configura el webhook"

# Comando que ejecuta todo el proceso
telegram-all:
	@echo "$(BLUE)🚀 Iniciando proceso completo de deployment...$(RESET)"
	@echo "$(BLUE)Paso 1/4: Configuración inicial$(RESET)"
	@make telegram-setup
	@echo "\n$(BLUE)Paso 2/4: Configurando variables de entorno$(RESET)"
	@make telegram-env
	@echo "\n$(BLUE)Paso 3/4: Desplegando bot$(RESET)"
	@make telegram-deploy
	@echo "\n$(BLUE)Paso 4/4: Configurando webhook$(RESET)"
	@make telegram-webhook
	@echo "\n$(GREEN)✨ ¡Deployment completado! Tu bot está listo.$(RESET)"
	@echo "$(BLUE)Puedes verificar el estado en: https://railway.app/dashboard$(RESET)"

# Comandos específicos para el bot de Telegram
telegram-setup:
	@echo "$(BLUE)🚀 Configurando bot de Telegram...$(RESET)"
	@cd $(SRC_DIR)/cmd/telegram-bot && $(RAILWAY) link
	@echo "$(GREEN)✓ Bot vinculado a Railway$(RESET)"

telegram-dev:
	@echo "$(BLUE)🚀 Iniciando bot en desarrollo...$(RESET)"
	@cd $(SRC_DIR) && npm run dev:telegram

telegram-deploy:
	@echo "$(BLUE)🚀 Desplegando bot a Railway...$(RESET)"
	@cd $(SRC_DIR)/cmd/telegram-bot && $(RAILWAY) up
	@echo "$(GREEN)✓ Bot desplegado$(RESET)"

telegram-webhook:
	@echo "$(BLUE)🔗 Configurando webhook...$(RESET)"
	@source $(ENV_FILE) && curl -X POST \
		https://api.telegram.org/bot$$BOT_TOKEN/setWebhook \
		-H "Content-Type: application/json" \
		-d "{\"url\": \"$$WEBHOOK_URL/api/telegram/webhook\", \"secret_token\": \"$$WEBHOOK_SECRET\"}"
	@echo "$(GREEN)✓ Webhook configurado$(RESET)"

