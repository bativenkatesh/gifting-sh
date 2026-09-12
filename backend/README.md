# Gifting SH backend

## Development

```bash
npm install
npm run dev
```

The server checks the Neon PostgreSQL connection with Sequelize before it starts
listening. Set `DATABASE_URL` and `JWT_SECRET` in `.env.local` or `.env`.

## Authentication API

`POST /api/v1/auth/signup`

```json
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "at-least-8-characters" }
```

`POST /api/v1/auth/login`

```json
{ "email": "ada@example.com", "password": "at-least-8-characters" }
```

Both endpoints return a JWT and the public user profile. Password hashes are
never included in responses.
# Gifting SH Backend

Express API foundation following an MVC structure.

## Run locally

```bash
npm install
cp .env.example .env
npm run dev
```

The API starts on `http://localhost:5000` by default.

## Scripts

- `npm run dev`: starts the API with Nodemon.
- `npm start`: starts the API for production.
- `npm test`: runs the Node test suite.

## Structure

```text
src/
  config/          Environment and application configuration
  controllers/     HTTP request handlers
  middleware/      Cross-cutting HTTP middleware
  routes/          Versioned API route definitions
  app.js           Express app composition
  server.js        HTTP server lifecycle and startup
```

## Endpoints

- `GET /`: service metadata
- `GET /api/v1/health`: health check
