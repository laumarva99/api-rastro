# API Rastro

API de **Rastro**, una app para comprar y vender cosas de segunda mano en la Comunitat Valenciana.

Está hecha con **Express**, **TypeScript** y **MongoDB**. Es la continuación de la entrega de MongoDB, donde diseñé la base de datos. Se añaden en cada apartado unos comentarios para que posteriormente puedan guiar mejor la comprensión de lectura del código.

## Tecnologías

- Node.js 24
- Express 5
- TypeScript
- MongoDB (driver oficial `mongodb`)
- Docker (para ejecutar MongoDB)
- ESLint y GitHub Actions (CI)

## Requisitos

- Node.js 24
- Docker con el contenedor `mongodb-practica`

## Cómo arrancarla

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.example` como `.env` y pon tu usuario y contraseña de MongoDB:

   ```bash
   cp .env.example .env
   ```

3. Arranca MongoDB:

   ```bash
   docker start mongodb-practica
   ```

4. Carga los datos de prueba en la base de datos `rastro` (apartado 1.1 del enunciado).

5. Arranca la API:

   ```bash
   npm run dev
   ```

   La API queda en `http://localhost:3000`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Arranca la API y la reinicia al guardar |
| `npm run lint` | Revisa el código con ESLint |
| `npm run typecheck` | Comprueba los tipos de TypeScript |

## Rutas

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/health` | Comprueba que la API y MongoDB funcionan |
| `GET` | `/api/listings` |