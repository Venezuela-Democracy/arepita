# Variables
RAILWAY := railway
ENV_FILE := .env

# Colores
BLUE := \033[0;34m
GREEN := \033[0;32m
RED := \033[0;31m
YELLOW := \033[1;33m
RESET := \033[0m

# Telegram Bot Commands
.PHONY: telegram-setup telegram-setup-env telegram-setup-domain telegram-deploy telegram-set-webhook telegram-all telegram-init

# Comandos de configuración inicial (solo se usan una vez)
telegram-setup:
	@echo "$(BLUE)🔗 Configurando proyecto en Railway...$(RESET)"
	@$(RAILWAY) login
	@$(RAILWAY) link
	@echo "$(GREEN)✅ Proyecto vinculado correctamente$(RESET)"

telegram-setup-env:
	@echo "$(BLUE)🔧 Configurando variables de entorno en Railway...$(RESET)"
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "$(RED)❌ Error: Archivo .env no encontrado$(RESET)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Leyendo variables del .env...$(RESET)"
	@grep -v '^#' $(ENV_FILE) | grep -v '^$$' | grep -vE '^(NODE_ENV|PORT)=' | while IFS='=' read -r key value; do \
		$(RAILWAY) variables --set "$$key=$$value"; \
	done
	@$(RAILWAY) variables --set "NODE_ENV=production"
	@echo "$(GREEN)✅ Variables de entorno configuradas$(RESET)"

telegram-setup-domain:
	@echo "$(BLUE)🌐 Configurando dominio...$(RESET)"
	@domain=$$($(RAILWAY) domain | grep "https://" | cut -d' ' -f2); \
	if [ -n "$$domain" ]; then \
		$(RAILWAY) variables --set "WEBHOOK_DOMAIN=$$domain"; \
		echo "$(GREEN)✅ Dominio configurado: $$domain$(RESET)"; \
	else \
		echo "$(RED)❌ Error: No se pudo obtener el dominio$(RESET)"; \
		exit 1; \
	fi

telegram-check-vars:
	@echo "$(BLUE)🔍 Verificando variables...$(RESET)"
	@if ! $(RAILWAY) variables --json >/dev/null 2>&1; then \
		echo "$(RED)❌ Error: No se pueden obtener las variables. ¿Estás conectado a Railway?$(RESET)"; \
		exit 1; \
	fi
	@vars=$$($(RAILWAY) variables --json); \
	webhook_domain=$$(echo "$$vars" | jq -r '.WEBHOOK_DOMAIN // "no configurado"'); \
	bot_token=$$(echo "$$vars" | jq -r '.BOT_TOKEN // "no configurado"'); \
	webhook_secret=$$(echo "$$vars" | jq -r '.WEBHOOK_SECRET // "no configurado"'); \
	echo "Variables configuradas:"; \
	echo "  WEBHOOK_DOMAIN: $$webhook_domain"; \
	echo "  BOT_TOKEN: $$(echo $$bot_token | cut -c1-10)..."; \
	echo "  WEBHOOK_SECRET: $$(echo $$webhook_secret | cut -c1-10)..."; \
	if [ "$$webhook_domain" = "no configurado" ] || [ "$$bot_token" = "no configurado" ] || [ "$$webhook_secret" = "no configurado" ]; then \
		echo "$(RED)❌ Faltan variables por configurar$(RESET)"; \
		exit 1; \
	else \
		echo "$(GREEN)✅ Todas las variables están configuradas$(RESET)"; \
	fi
# Comandos de uso diario
telegram-deploy: telegram-setup-env
	@echo "$(BLUE)🚀 Desplegando bot a Railway...$(RESET)"
	@$(RAILWAY) up -d
	@echo "$(GREEN)✅ Bot desplegado correctamente$(RESET)"

telegram-set-webhook: telegram-setup-domain
	@echo "$(BLUE)🔗 Configurando webhook del bot...$(RESET)"
	@vars=$$($(RAILWAY) variables --json); \
	webhook_domain=$$(echo "$$vars" | jq -r '.WEBHOOK_DOMAIN'); \
	bot_token=$$(echo "$$vars" | jq -r '.BOT_TOKEN'); \
	webhook_secret=$$(echo "$$vars" | jq -r '.WEBHOOK_SECRET'); \
	echo "$(BLUE)Verificando variables:$(RESET)"; \
	echo "  WEBHOOK_DOMAIN: $$webhook_domain"; \
	echo "  BOT_TOKEN: $$(echo $$bot_token | cut -c1-10)..."; \
	echo "  WEBHOOK_SECRET: $$(echo $$webhook_secret | cut -c1-10)..."; \
	echo "$(BLUE)Configurando webhook...$(RESET)"; \
	response=$$(curl -s -X POST \
		-H "Content-Type: application/json" \
		-d "{\"url\":\"$$webhook_domain/api/telegram/webhook\", \"secret_token\":\"$$webhook_secret\"}" \
		"https://api.telegram.org/bot$$bot_token/setWebhook"); \
	if echo "$$response" | jq -e '.ok' >/dev/null; then \
		echo "$(GREEN)✅ Webhook configurado correctamente$(RESET)"; \
	else \
		echo "$(RED)❌ Error configurando webhook:$(RESET)"; \
		echo "$$response" | jq '.'; \
		echo "$(YELLOW)Posibles problemas:$(RESET)"; \
		echo "1. Token del bot inválido"; \
		echo "2. URL del webhook mal formada"; \
		echo "3. Webhook secret inválido"; \
		exit 1; \
	fi

# Comandos principales
telegram-init: telegram-setup telegram-setup-env telegram-setup-domain telegram-deploy telegram-set-webhook
telegram-all: telegram-deploy telegram-set-webhook

# Utilidades
telegram-delete-webhook:
	@echo "$(BLUE)🔗 Eliminando webhook del bot...$(RESET)"
	@bot_token=$$($(RAILWAY) variables --json | grep -o '"BOT_TOKEN":"[^"]*' | cut -d'"' -f4); \
	curl -X POST "https://api.telegram.org/bot$$bot_token/deleteWebhook"
	@echo "$(GREEN)✅ Webhook eliminado correctamente$(RESET)"