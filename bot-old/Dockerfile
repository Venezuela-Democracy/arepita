# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copiar dependencias y build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Configurar variables de entorno
ENV NODE_ENV=production
ENV PORT=8080

# Exponer puerto
EXPOSE 8080

# Iniciar la aplicación
CMD ["npm", "start"]