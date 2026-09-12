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
