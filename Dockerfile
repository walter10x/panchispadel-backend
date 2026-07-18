# Etapa 1: Construcción (Build)
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias necesarias para el build
COPY package.json package-lock.json ./
RUN npm ci

# Copiar el código fuente y el tsconfig
COPY tsconfig.json ./
COPY src/ ./src/

# Realizar el build de TypeScript
RUN npm run build

# Etapa 2: Producción
FROM node:20-alpine AS runner

WORKDIR /app

# Instalar solo dependencias de producción
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copiar el código compilado desde la etapa de construcción
COPY --from=builder /app/dist ./dist

# Copiar los archivos JSON de configuración (firebase-service-account)
COPY src/config/*.json ./dist/config/

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Seed (admin/clubs) y luego API
CMD ["sh", "-c", "node dist/config/seeds/index.js && exec node dist/config/server.js"]
