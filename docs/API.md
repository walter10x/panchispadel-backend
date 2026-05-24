# 📡 API Reference — PanchisPádel V1

> API REST del backend de PanchisPádel.  
> Base URL: `http://localhost:3000/api` (desarrollo)  
> Formato: `JSON`  
> **Última actualización**: 13 de mayo de 2026

---

## Autenticación

Todos los endpoints marcados como **Auth: Sí** requieren el header:

```
Authorization: Bearer <accessToken>
```

El `accessToken` expira en **15 minutos**. Usar `POST /api/auth/refresh` para obtener uno nuevo.

---

## Índice de endpoints

| Grupo | Endpoints |
|-------|-----------|
| [Autenticación](#1-autenticación) | register, login, refresh, logout |
| [Usuarios](#2-usuarios) | getProfile, updateProfile, getUserById |
| [Partidos](#3-partidos) | list, create, getById, update, delete, join, leave, confirmPlayer, rejectPlayer |
| [Resultados](#4-resultados) | createResult, confirmResult |
| [Clubes](#5-clubes) | list, getById |
| [Notificaciones](#6-notificaciones) | list, unreadCount, markAsRead |

---

## 1. Autenticación

### 1.1 Registrar usuario

Registra un nuevo usuario en la plataforma.

```
POST /api/auth/register
Content-Type: application/json
Auth: No
```

#### Request body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `email` | string | Sí | Email válido |
| `password` | string | Sí | Mín. 8 caracteres, 1 mayúscula, 1 número, 1 símbolo |
| `name` | string | Sí | Nombre visible (2-50 caracteres) |
| `level` | string | Sí | `BEGINNER` \| `MEDIUM` \| `ADVANCED` \| `PRO` |

```json
{
  "email": "carlos@email.com",
  "password": "Password123!",
  "name": "Carlos Martínez",
  "level": "MEDIUM"
}
```

#### Response 201 Created

```json
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "carlos@email.com",
    "name": "Carlos Martínez",
    "level": "MEDIUM",
    "photoUrl": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 400 | `{ "error": "VALIDATION_ERROR", "message": "Email no válido" }` | Datos inválidos |
| 409 | `{ "error": "EMAIL_ALREADY_EXISTS", "message": "Ya existe un usuario con ese email" }` | Email duplicado |

#### Ejemplo curl

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos@email.com",
    "password": "Password123!",
    "name": "Carlos Martínez",
    "level": "MEDIUM"
  }'
```

---

### 1.2 Iniciar sesión

```
POST /api/auth/login
Content-Type: application/json
Auth: No
```

#### Request body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `email` | string | Sí | Email del usuario |
| `password` | string | Sí | Contraseña |

```json
{
  "email": "carlos@email.com",
  "password": "Password123!"
}
```

#### Response 200 OK

```json
{
  "user": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "email": "carlos@email.com",
    "name": "Carlos Martínez",
    "level": "MEDIUM",
    "photoUrl": null
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 400 | `{ "error": "VALIDATION_ERROR", "message": "Email y contraseña requeridos" }` | Faltan campos |
| 401 | `{ "error": "INVALID_CREDENTIALS", "message": "Email o contraseña incorrectos" }` | Credenciales inválidas |

#### Ejemplo curl

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos@email.com",
    "password": "Password123!"
  }'
```

---

### 1.3 Refrescar token

Obtiene un nuevo access token usando el refresh token.

```
POST /api/auth/refresh
Content-Type: application/json
Auth: No
```

#### Request body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `refreshToken` | string | Sí | Refresh token recibido en login/register |

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response 200 OK

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "INVALID_REFRESH_TOKEN", "message": "Refresh token inválido o expirado" }` | Token no válido |

#### Ejemplo curl

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

---

### 1.4 Cerrar sesión

Invalida el refresh token actual.

```
POST /api/auth/logout
Content-Type: application/json
Auth: Sí
```

#### Request body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `refreshToken` | string | Sí | Refresh token a invalidar |

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Response 200 OK

```json
{
  "message": "Sesión cerrada correctamente"
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token de acceso inválido |

#### Ejemplo curl

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

---

## 2. Usuarios

### 2.1 Obtener perfil propio

```
GET /api/users/me
Auth: Sí
```

#### Response 200 OK

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "carlos@email.com",
  "name": "Carlos Martínez",
  "level": "MEDIUM",
  "photoUrl": null,
  "matchesPlayed": 12,
  "matchesWon": 8,
  "createdAt": "2026-05-01T10:00:00.000Z"
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |

#### Ejemplo curl

```bash
curl -X GET http://localhost:3000/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### 2.2 Actualizar perfil

```
PATCH /api/users/me
Content-Type: application/json
Auth: Sí
```

#### Request body

Todos los campos son opcionales. Solo se actualizan los enviados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `name` | string | Nuevo nombre (2-50 caracteres) |
| `level` | string | `BEGINNER` \| `MEDIUM` \| `ADVANCED` \| `PRO` |
| `photoUrl` | string \| null | URL de foto de perfil |

```json
{
  "name": "Carlos Martínez López",
  "level": "ADVANCED",
  "photoUrl": "https://storage.example.com/photos/carlos.jpg"
}
```

#### Response 200 OK

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "carlos@email.com",
  "name": "Carlos Martínez López",
  "level": "ADVANCED",
  "photoUrl": "https://storage.example.com/photos/carlos.jpg"
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 400 | `{ "error": "VALIDATION_ERROR", "message": "Nivel no válido" }` | Campo inválido |
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |

#### Ejemplo curl

```bash
curl -X PATCH http://localhost:3000/api/users/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Carlos Martínez López",
    "level": "ADVANCED"
  }'
```

---

### 2.3 Ver perfil de otro usuario

```
GET /api/users/:id
Auth: Sí
```

#### Response 200 OK

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Carlos Martínez",
  "level": "MEDIUM",
  "photoUrl": null,
  "matchesPlayed": 12,
  "matchesWon": 8
}
```

> Nota: no se devuelve el email por privacidad.

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |
| 404 | `{ "error": "USER_NOT_FOUND", "message": "Usuario no encontrado" }` | ID no existe |

#### Ejemplo curl

```bash
curl -X GET http://localhost:3000/api/users/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 3. Partidos

### 3.1 Listar partidos

Lista partidos abiertos con filtros opcionales.

```
GET /api/matches?status=OPEN&clubId=<uuid>&date=2026-05-15
Auth: Sí
```

#### Query params

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `status` | string | Filtrar por estado: `OPEN` \| `FULL` \| `COMPLETED` \| `CANCELLED` |
| `clubId` | uuid | Filtrar por club |
| `date` | string (YYYY-MM-DD) | Filtrar por fecha |
| `level` | string | Filtrar por nivel mínimo: `BEGINNER` \| `MEDIUM` \| `ADVANCED` \| `PRO` |
| `page` | number | Número de página (default: 1) |
| `limit` | number | Resultados por página (default: 20, max: 50) |

#### Response 200 OK

```json
{
  "data": [
    {
      "id": "m1n2b3v4-c5x6-7890-erty-ef1234567890",
      "creator": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Carlos Martínez",
        "level": "MEDIUM"
      },
      "club": {
        "id": "c1l2u3b4-e5f6-7890-abcd-ef1234567890",
        "name": "Pádel Indoor Logroño"
      },
      "dateTime": "2026-05-15T18:00:00.000Z",
      "durationMinutes": 90,
      "status": "OPEN",
      "maxPlayers": 4,
      "level": "MEDIUM",
      "currentPlayers": 2,
      "players": [
        {
          "playerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "name": "Carlos Martínez",
          "level": "MEDIUM",
          "status": "CONFIRMED"
        },
        {
          "playerId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "name": "Ana García",
          "level": "ADVANCED",
          "status": "CONFIRMED"
        }
      ]
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 400 | `{ "error": "VALIDATION_ERROR", "message": "Parámetro de filtro no válido" }` | Query inválido |
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |

#### Ejemplo curl

```bash
curl -X GET "http://localhost:3000/api/matches?status=OPEN&date=2026-05-15" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### 3.2 Crear partido

Crea un nuevo partido. El creador se une automáticamente como jugador confirmado.

```
POST /api/matches
Content-Type: application/json
Auth: Sí
```

#### Request body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `clubId` | uuid | Sí | ID del club donde se juega |
| `dateTime` | string (ISO) | Sí | Fecha y hora del partido |
| `level` | string | No | Nivel requerido: `BEGINNER` \| `MEDIUM` \| `ADVANCED` \| `PRO` (default: `MEDIUM`) |
| `durationMinutes` | number | No | Duración en minutos (default: 90) |
| `maxPlayers` | number | No | Máximo de jugadores (default: 4, min: 2, max: 8) |

```json
{
  "clubId": "c1l2u3b4-e5f6-7890-abcd-ef1234567890",
  "dateTime": "2026-05-15T18:00:00.000Z",
  "level": "MEDIUM",
  "durationMinutes": 90,
  "maxPlayers": 4
}
```

#### Response 201 Created

```json
{
  "id": "m1n2b3v4-c5x6-7890-erty-ef1234567890",
  "creator": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Carlos Martínez",
    "level": "MEDIUM"
  },
  "club": {
    "id": "c1l2u3b4-e5f6-7890-abcd-ef1234567890",
    "name": "Pádel Indoor Logroño"
  },
  "dateTime": "2026-05-15T18:00:00.000Z",
  "durationMinutes": 90,
  "status": "OPEN",
  "maxPlayers": 4,
  "level": "MEDIUM",
  "currentPlayers": 1,
  "players": [
    {
      "playerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Carlos Martínez",
      "level": "MEDIUM",
      "status": "CONFIRMED"
    }
  ],
  "createdAt": "2026-05-10T12:00:00.000Z"
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 400 | `{ "error": "VALIDATION_ERROR", "message": "Fecha del partido debe ser futura" }` | Datos inválidos |
| 404 | `{ "error": "CLUB_NOT_FOUND", "message": "Club no encontrado" }` | clubId no existe |
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |

#### Ejemplo curl

```bash
curl -X POST http://localhost:3000/api/matches \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "clubId": "c1l2u3b4-e5f6-7890-abcd-ef1234567890",
    "dateTime": "2026-05-15T18:00:00.000Z",
    "level": "MEDIUM",
    "durationMinutes": 90,
    "maxPlayers": 4
  }'
```

---

### 3.3 Ver detalle de partido

```
GET /api/matches/:id
Auth: Sí
```

#### Response 200 OK

```json
{
  "id": "m1n2b3v4-c5x6-7890-erty-ef1234567890",
  "creator": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Carlos Martínez",
    "level": "MEDIUM"
  },
  "club": {
    "id": "c1l2u3b4-e5f6-7890-abcd-ef1234567890",
    "name": "Pádel Indoor Logroño",
    "address": "Calle de la Pista, 12, Logroño"
  },
  "dateTime": "2026-05-15T18:00:00.000Z",
  "durationMinutes": 90,
  "status": "OPEN",
  "maxPlayers": 4,
  "level": "MEDIUM",
  "currentPlayers": 2,
  "players": [
    {
      "playerId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Carlos Martínez",
      "level": "MEDIUM",
      "status": "CONFIRMED"
    },
    {
      "playerId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "name": "Ana García",
      "level": "ADVANCED",
      "status": "PENDING"
    }
  ],
  "result": null,
  "createdAt": "2026-05-10T12:00:00.000Z"
}
```

Si el partido tiene resultado:

```json
{
  "result": {
    "team1Score": 2,
    "team2Score": 1,
    "confirmedBy": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Carlos Martínez"
    },
    "confirmed": true,
    "createdAt": "2026-05-15T20:00:00.000Z"
  }
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |
| 404 | `{ "error": "MATCH_NOT_FOUND", "message": "Partido no encontrado" }` | ID no existe |

#### Ejemplo curl

```bash
curl -X GET http://localhost:3000/api/matches/m1n2b3v4-c5x6-7890-erty-ef1234567890 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### 3.4 Unirse a un partido

El usuario autenticado se une al partido.

```
POST /api/matches/:id/join
Auth: Sí
```

#### Response 200 OK

```json
{
  "id": "m1n2b3v4-c5x6-7890-erty-ef1234567890",
  "status": "OPEN",
  "level": "MEDIUM",
  "currentPlayers": 3,
  "players": [
    { "playerId": "a1b2...", "name": "Carlos Martínez", "level": "MEDIUM", "status": "CONFIRMED" },
    { "playerId": "b2c3...", "name": "Ana García", "level": "ADVANCED", "status": "CONFIRMED" },
    { "playerId": "c3d4...", "name": "Luis Pérez", "level": "MEDIUM", "status": "PENDING" }
  ]
}
```

Si el partido se llena (llega a `maxPlayers`), el `status` cambia a `FULL`.

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |
| 404 | `{ "error": "MATCH_NOT_FOUND", "message": "Partido no encontrado" }` | ID no existe |
| 409 | `{ "error": "MATCH_NOT_OPEN", "message": "El partido no está abierto" }` | No se puede unir |
| 409 | `{ "error": "ALREADY_JOINED", "message": "Ya estás apuntado a este partido" }` | Usuario ya registrado |
| 409 | `{ "error": "MATCH_FULL", "message": "El partido está completo" }` | Sin cupo |

#### Ejemplo curl

```bash
curl -X POST http://localhost:3000/api/matches/m1n2b3v4-c5x6-7890-erty-ef1234567890/join \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### 3.5 Abandonar un partido

El usuario autenticado abandona el partido. El creador no puede abandonar si es el único jugador.

```
POST /api/matches/:id/leave
Auth: Sí
```

#### Response 200 OK

```json
{
  "message": "Has abandonado el partido",
  "match": {
    "id": "m1n2b3v4-c5x6-7890-erty-ef1234567890",
    "status": "OPEN",
    "currentPlayers": 1
  }
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |
| 404 | `{ "error": "MATCH_NOT_FOUND", "message": "Partido no encontrado" }` | ID no existe |
| 404 | `{ "error": "NOT_JOINED", "message": "No estás apuntado a este partido" }` | Usuario no en partido |
| 409 | `{ "error": "CREATOR_CANT_LEAVE", "message": "El creador no puede abandonar si es el único jugador" }` | Regla de negocio |

#### Ejemplo curl

```bash
curl -X POST http://localhost:3000/api/matches/m1n2b3v4-c5x6-7890-erty-ef1234567890/leave \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### 3.6 Actualizar partido

El creador puede modificar los datos de un partido existente.

```
PUT /api/matches/:id
Content-Type: application/json
Auth: Sí
```

#### Request body

Todos los campos son opcionales. Solo se actualizan los enviados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `dateTime` | string (ISO) | Nueva fecha y hora |
| `clubId` | uuid | Nuevo club |
| `level` | string | `BEGINNER` \| `MEDIUM` \| `ADVANCED` \| `PRO` |
| `durationMinutes` | number | Nueva duración |
| `maxPlayers` | number | Nuevo máximo de jugadores |

```json
{
  "dateTime": "2026-05-16T19:00:00.000Z",
  "level": "ADVANCED",
  "maxPlayers": 6
}
```

#### Response 200 OK

```json
{
  "id": "m1n2b3v4-c5x6-7890-erty-ef1234567890",
  "status": "OPEN",
  "level": "ADVANCED",
  "dateTime": "2026-05-16T19:00:00.000Z",
  "maxPlayers": 6,
  "players": [
    { "playerId": "a1b2...", "name": "Carlos Martínez", "status": "CONFIRMED" }
  ]
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |
| 403 | `{ "error": "NOT_CREATOR", "message": "Solo el creador puede modificar el partido" }` | No es el creador |
| 404 | `{ "error": "MATCH_NOT_FOUND" }` | ID no existe |

#### Ejemplo curl

```bash
curl -X PUT http://localhost:3000/api/matches/m1n2b3v4-c5x6-7890-erty-ef1234567890 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "dateTime": "2026-05-16T19:00:00.000Z",
    "level": "ADVANCED"
  }'
```

---

### 3.7 Eliminar partido

El creador puede eliminar un partido. Se notifica a los jugadores apuntados.

```
DELETE /api/matches/:id
Auth: Sí
```

#### Response 200 OK

```json
{
  "message": "Partido eliminado correctamente"
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |
| 403 | `{ "error": "NOT_CREATOR", "message": "Solo el creador puede eliminar el partido" }` | No es el creador |
| 404 | `{ "error": "MATCH_NOT_FOUND" }` | ID no existe |

#### Ejemplo curl

```bash
curl -X DELETE http://localhost:3000/api/matches/m1n2b3v4-c5x6-7890-erty-ef1234567890 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### 3.8 Confirmar jugador

El creador del partido confirma a un jugador que está en estado `PENDING`.

```
POST /api/matches/:id/confirm/:playerId
Auth: Sí
```

#### Response 200 OK

```json
{
  "playerId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "name": "Ana García",
  "status": "CONFIRMED",
  "matchStatus": "OPEN",
  "currentPlayers": 2
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |
| 403 | `{ "error": "NOT_CREATOR", "message": "Solo el creador puede confirmar jugadores" }` | No es creador |
| 404 | `{ "error": "MATCH_NOT_FOUND" }` | Partido no existe |
| 404 | `{ "error": "PLAYER_NOT_FOUND", "message": "El jugador no está en este partido" }` | No es jugador |
| 409 | `{ "error": "ALREADY_CONFIRMED", "message": "El jugador ya está confirmado" }` | Ya confirmado |

#### Ejemplo curl

```bash
curl -X POST http://localhost:3000/api/matches/m1n2b3v4-c5x6-7890-erty-ef1234567890/confirm/b2c3d4e5-f6a7-8901-bcde-f12345678901 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### 3.9 Rechazar jugador

El creador del partido rechaza a un jugador que está en estado `PENDING`. El jugador es eliminado del partido.

```
POST /api/matches/:id/reject/:playerId
Auth: Sí
```

#### Response 200 OK

```json
{
  "message": "Jugador rechazado del partido",
  "playerId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "matchStatus": "OPEN",
  "currentPlayers": 1
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |
| 403 | `{ "error": "NOT_CREATOR", "message": "Solo el creador puede rechazar jugadores" }` | No es creador |
| 404 | `{ "error": "MATCH_NOT_FOUND" }` | Partido no existe |
| 404 | `{ "error": "PLAYER_NOT_FOUND", "message": "El jugador no está en este partido" }` | No es jugador |

#### Ejemplo curl

```bash
curl -X POST http://localhost:3000/api/matches/m1n2b3v4-c5x6-7890-erty-ef1234567890/reject/b2c3d4e5-f6a7-8901-bcde-f12345678901 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 4. Resultados

### 4.1 Registrar resultado

Registra el marcador de un partido. Solo un jugador del partido puede registrar el resultado.

```
POST /api/matches/:id/result
Content-Type: application/json
Auth: Sí
```

#### Request body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `team1Score` | number | Sí | Sets ganados por el equipo 1 (0-3) |
| `team2Score` | number | Sí | Sets ganados por el equipo 2 (0-3) |

```json
{
  "team1Score": 2,
  "team2Score": 1
}
```

#### Response 201 Created

```json
{
  "id": "r1e2s3u4-l5t6-7890-abcd-ef1234567890",
  "matchId": "m1n2b3v4-c5x6-7890-erty-ef1234567890",
  "team1Score": 2,
  "team2Score": 1,
  "confirmedBy": null,
  "confirmed": false,
  "createdAt": "2026-05-15T20:00:00.000Z"
}
```

> El resultado queda en estado **no confirmado**. El otro jugador debe confirmarlo.

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 400 | `{ "error": "VALIDATION_ERROR", "message": "Los scores no pueden ser iguales en pádel" }` | Datos inválidos |
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |
| 403 | `{ "error": "NOT_MATCH_PLAYER", "message": "Solo los jugadores del partido pueden registrar resultado" }` | No es jugador |
| 404 | `{ "error": "MATCH_NOT_FOUND" }` | Partido no existe |
| 409 | `{ "error": "MATCH_NOT_COMPLETED", "message": "El partido aún no ha finalizado" }` | Fecha futura |
| 409 | `{ "error": "RESULT_ALREADY_EXISTS", "message": "Ya hay un resultado registrado" }` | Resultado duplicado |

#### Ejemplo curl

```bash
curl -X POST http://localhost:3000/api/matches/m1n2b3v4-c5x6-7890-erty-ef1234567890/result \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "team1Score": 2,
    "team2Score": 1
  }'
```

---

### 4.2 Confirmar resultado

El segundo jugador confirma el resultado del partido.

```
POST /api/matches/:id/result/confirm
Auth: Sí
```

#### Response 200 OK

```json
{
  "id": "r1e2s3u4-l5t6-7890-abcd-ef1234567890",
  "matchId": "m1n2b3v4-c5x6-7890-erty-ef1234567890",
  "confirmed": true,
  "confirmedBy": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "name": "Ana García"
  }
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |
| 403 | `{ "error": "NOT_MATCH_PLAYER", "message": "Solo jugadores del partido pueden confirmar" }` | No es jugador |
| 403 | `{ "error": "SAME_REGISTRANT", "message": "No puedes confirmar tu propio resultado" }` | Mismo usuario |
| 404 | `{ "error": "RESULT_NOT_FOUND", "message": "No hay resultado pendiente de confirmación" }` | Sin resultado |
| 409 | `{ "error": "ALREADY_CONFIRMED", "message": "El resultado ya fue confirmado" }` | Ya confirmado |

#### Ejemplo curl

```bash
curl -X POST http://localhost:3000/api/matches/m1n2b3v4-c5x6-7890-erty-ef1234567890/result/confirm \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 5. Clubes

### 5.1 Listar clubes

Devuelve todos los clubes registrados en la plataforma.

```
GET /api/clubs
Auth: Sí
```

#### Response 200 OK

```json
{
  "data": [
    {
      "id": "c1l2u3b4-e5f6-7890-abcd-ef1234567890",
      "name": "Pádel Indoor Logroño",
      "address": "Calle de la Pista, 12, Logroño",
      "phone": "941 123 456",
      "courtsCount": 6,
      "latitude": 42.465,
      "longitude": -2.445,
      "hasLighting": true,
      "hasParking": true
    },
    {
      "id": "c2l3u4b5-e5f6-7890-abcd-ef1234567891",
      "name": "Rioja Pádel Center",
      "address": "Av. de La Rioja, 34, Logroño",
      "phone": "941 789 012",
      "courtsCount": 4,
      "latitude": 42.470,
      "longitude": -2.430,
      "hasLighting": true,
      "hasParking": false
    }
  ]
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |

#### Ejemplo curl

```bash
curl -X GET http://localhost:3000/api/clubs \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### 5.2 Ver detalle de club

```
GET /api/clubs/:id
Auth: Sí
```

#### Response 200 OK

```json
{
  "id": "c1l2u3b4-e5f6-7890-abcd-ef1234567890",
  "name": "Pádel Indoor Logroño",
  "address": "Calle de la Pista, 12, Logroño",
  "phone": "941 123 456",
  "courtsCount": 6,
  "latitude": 42.465,
  "longitude": -2.445,
  "hasLighting": true,
  "hasParking": true,
  "schedule": {
    "monday": "08:00-23:00",
    "tuesday": "08:00-23:00",
    "wednesday": "08:00-23:00",
    "thursday": "08:00-23:00",
    "friday": "08:00-00:00",
    "saturday": "09:00-00:00",
    "sunday": "09:00-22:00"
  },
  "activeMatches": 3,
  "createdAt": "2026-01-15T10:00:00.000Z"
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |
| 404 | `{ "error": "CLUB_NOT_FOUND", "message": "Club no encontrado" }` | ID no existe |

#### Ejemplo curl

```bash
curl -X GET http://localhost:3000/api/clubs/c1l2u3b4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 6. Notificaciones

### 6.1 Listar notificaciones

Devuelve las notificaciones del usuario autenticado, ordenadas por fecha descendente.

```
GET /api/notifications?unreadOnly=true&page=1&limit=20
Auth: Sí
```

#### Query params

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `unreadOnly` | boolean | Si es `true`, solo devuelve no leídas |
| `page` | number | Número de página (default: 1) |
| `limit` | number | Resultados por página (default: 20, max: 50) |

#### Response 200 OK

```json
{
  "data": [
    {
      "id": "n1o2t3i4-f5i6-7890-abcd-ef1234567890",
      "type": "MATCH_CREATED",
      "title": "Nuevo partido creado",
      "body": "Carlos Martínez ha creado un partido en Pádel Indoor Logroño para el 15 de mayo a las 18:00",
      "data": {
        "matchId": "m1n2b3v4-c5x6-7890-erty-ef1234567890",
        "creatorId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
      },
      "isRead": false,
      "createdAt": "2026-05-10T12:00:00.000Z"
    },
    {
      "id": "n2o3t4i5-f6i7-8901-bcde-f12345678901",
      "type": "PLAYER_JOINED",
      "title": "Nuevo jugador en tu partido",
      "body": "Ana García se ha unido a tu partido en Pádel Indoor Logroño",
      "data": {
        "matchId": "m2n3b4v5-c6x7-8901-erty-f12345678901",
        "playerId": "b2c3d4e5-f6a7-8901-bcde-f12345678901"
      },
      "isRead": true,
      "createdAt": "2026-05-09T20:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 2,
    "unreadCount": 1
  }
}
```

#### Tipos de notificación

| Tipo | Significado |
|------|-------------|
| `MATCH_CREATED` | Nuevo partido disponible en un club cercano |
| `MATCH_FULL` | El partido al que te apuntaste se ha completado |
| `MATCH_CANCELLED` | Un partido ha sido cancelado |
| `RESULT_PENDING` | Tienes un resultado pendiente de confirmar |
| `PLAYER_JOINED` | Alguien se unió a tu partido |
| `PLAYER_LEFT` | Alguien abandonó tu partido |

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |

#### Ejemplo curl

```bash
curl -X GET "http://localhost:3000/api/notifications?unreadOnly=true" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### 6.2 Contar notificaciones no leídas

Devuelve el número de notificaciones no leídas del usuario autenticado.

```
GET /api/notifications/unread-count
Auth: Sí
```

#### Response 200 OK

```json
{
  "unreadCount": 3
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |

#### Ejemplo curl

```bash
curl -X GET "http://localhost:3000/api/notifications/unread-count" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### 6.3 Marcar notificación como leída

```
PATCH /api/notifications/:id/read
Auth: Sí
```

#### Response 200 OK

```json
{
  "id": "n1o2t3i4-f5i6-7890-abcd-ef1234567890",
  "isRead": true
}
```

#### Errores

| Código | Body | Causa |
|--------|------|-------|
| 401 | `{ "error": "UNAUTHORIZED" }` | Token inválido |
| 404 | `{ "error": "NOTIFICATION_NOT_FOUND", "message": "Notificación no encontrada" }` | ID no existe |
| 403 | `{ "error": "NOT_OWNER", "message": "Esta notificación no te pertenece" }` | No es del usuario |

#### Ejemplo curl

```bash
curl -X PATCH http://localhost:3000/api/notifications/n1o2t3i4-f5i6-7890-abcd-ef1234567890/read \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Esquema de errores global

Todos los errores siguen este formato:

```json
{
  "error": "ERROR_CODE",
  "message": "Descripción legible del error",
  "details": [
    { "field": "email", "message": "El email no es válido" }
  ]
}
```

### Códigos de error comunes

| Código HTTP | Error | Significado |
|-------------|-------|-------------|
| 400 | `VALIDATION_ERROR` | Datos de entrada inválidos |
| 401 | `UNAUTHORIZED` | Token faltante o inválido |
| 401 | `TOKEN_EXPIRED` | Access token expirado |
| 403 | `FORBIDDEN` | No tienes permiso para esta acción |
| 404 | `*_NOT_FOUND` | Recurso no encontrado |
| 409 | `*_ALREADY_EXISTS` | Conflicto (recurso duplicado) |
| 409 | `*_NOT_OPEN` | El recurso no está disponible |
| 429 | `RATE_LIMIT_EXCEEDED` | Demasiadas peticiones |
| 500 | `INTERNAL_ERROR` | Error interno del servidor |

---

## Códigos de estado HTTP usados

| Código | Uso |
|--------|-----|
| 200 | GET, PATCH, POST (operaciones exitosas) |
| 201 | POST (creación de recurso) |
| 204 | DELETE (recurso eliminado) |
| 400 | Error de validación |
| 401 | No autenticado |
| 403 | No autorizado |
| 404 | Recurso no encontrado |
| 409 | Conflicto |
| 429 | Rate limit |
| 500 | Error interno |
