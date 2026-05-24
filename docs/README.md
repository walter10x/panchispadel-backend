# 🏓 PanchisPádel — Backend API

API REST para la plataforma de partidos de pádel en Logroño y La Rioja.

> **Última actualización**: 13 de mayo de 2026  
> **Tests**: 224 tests pasando ✅

[![Tests](https://img.shields.io/badge/tests-224%20passing-brightgreen)](#)

---

## Estado Actual

El MVP V1 está **completado**. Todos los módulos del backend están implementados y probados:

- ✅ **Usuarios**: registro, login, refresh token, logout, perfil
- ✅ **Partidos**: CRUD completo, unirse/salir, confirmar/rechazar jugadores, nivel requerido
- ✅ **Resultados**: registrar marcador, confirmación por otro jugador
- ✅ **Clubes**: listado estático con seed (5 clubes de Logroño con coordenadas)
- ✅ **Notificaciones**: listado, no leídas, marcar como leída

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js 20+ LTS |
| Framework | Express 4+ |
| Lenguaje | TypeScript 5+ (strict mode) |
| Base de datos | PostgreSQL 16 |
| ORM | TypeORM |
| Autenticación | JWT (access + refresh tokens) |
| Contenerización | Docker + Docker Compose |
| Testing | Jest + Supertest |
| Arquitectura | Hexagonal (Puertos y Adaptadores) |

---

## Requisitos previos

- Node.js >= 20 LTS
- Docker Desktop (o PostgreSQL 16 instalado localmente)
- Git

---

## Setup rápido

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd panchispadel-backend

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Iniciar todos los servicios con Docker
#    (api + db PostgreSQL 16 + pgadmin)
docker compose up -d

# 4. Instalar dependencias del proyecto
npm install

# 5. Poblar la base de datos con datos de prueba
npm run seed

# 6. ¡Listo! La API ya está corriendo en:
#    http://localhost:3000
```

> **Nota**: TypeORM está configurado con `synchronize: true` en desarrollo.  
> **No es necesario ejecutar migraciones**: las tablas se crean y actualizan automáticamente al iniciar el servidor.

### Inicio sin Docker (solo backend)

Si prefieres ejecutar solo la base de datos en Docker y el backend localmente:

```bash
# Solo la base de datos
docker compose up -d db

# Luego iniciar el servidor (con hot-reload)
npm run dev
```

El servidor arrancará en `http://localhost:3000`.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor en modo desarrollo con hot reload (tsx watch) |
| `npm run build` | Compila TypeScript a JavaScript (`dist/`) |
| `npm start` | Inicia servidor en producción |
| `npm test` | Ejecuta la suite de tests (224 tests) |
| `npm run test:watch` | Tests en modo watch |
| `npm run test:coverage` | Tests con reporte de cobertura |
| `npm run seed` | Pobla la base de datos con datos de prueba (5 clubes, usuarios) |
| `npm run lint` | Ejecuta ESLint sobre el código |
| `npm run format` | Formatea el código con Prettier |

---

## Estructura del proyecto

```
panchispadel-backend/
├── src/
│   ├── config/              # Configuración (server, database, env, seeds)
│   │   ├── database.ts      # Conexión TypeORM con sync automático
│   │   ├── server.ts        # Punto de entrada del servidor Express
│   │   ├── env.ts           # Validación de variables de entorno con Zod
│   │   └── seeds/           # Seed de clubs y datos iniciales
│   ├── modules/             # 5 módulos con arquitectura hexagonal
│   │   ├── users/           # Autenticación y perfiles
│   │   │   ├── domain/      # Entidades, Value Objects, interfaces
│   │   │   ├── application/ # Casos de uso, DTOs
│   │   │   ├── infrastructure/ # Repositorios TypeORM
│   │   │   └── http/        # Controladores, rutas, validación
│   │   ├── matches/         # Gestión de partidos
│   │   ├── results/         # Resultados y confirmaciones
│   │   ├── clubs/           # Información de clubes
│   │   └── notifications/   # Sistema de notificaciones
│   ├── shared/              # Código compartido
│   │   ├── domain/          # Base Entity, Value Objects genéricos
│   │   └── infrastructure/  # Middlewares (auth, error handler)
│   ├── app.ts               # Configuración de Express (helmet, cors, compression)
├── coverage/                # Reportes de cobertura de tests
├── docker-compose.yml       # Servicios: api, db (PostgreSQL 16), pgadmin
├── Dockerfile               # Imagen multi-etapa para producción
├── .env.example             # Plantilla de variables de entorno
├── tsconfig.json            # Configuración de TypeScript (strict mode)
├── jest.config.ts           # Configuración de Jest
├── jest.setup.ts            # Setup global de tests
└── package.json
```

---

## Variables de entorno (`.env`)

```env
# Servidor
NODE_ENV=development
PORT=3000

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=panchispadel
DB_USER=panchispadel
DB_PASSWORD=panchispadel_secret

# Autenticación JWT
JWT_ACCESS_SECRET=change_me_access_secret
JWT_REFRESH_SECRET=change_me_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:8080
```

---

## Documentación adicional

| Documento | Descripción |
|-----------|-------------|
| [Arquitectura](./ARCHITECTURE.md) | Diseño hexagonal, diagramas, base de datos |
| [API Endpoints](./API.md) | Documentación completa de endpoints V1 |
| [Contribuir](./CONTRIBUTING.md) | Guía para desarrolladores, TDD, convenciones |
