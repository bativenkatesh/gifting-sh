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

All `/api/v1/admin/*` routes require a valid Bearer token for an account whose
role is `admin`:

- `GET /summary`: sales/order/customer/product/low-stock overview
- `GET /orders`, `PATCH /orders/:orderId`: review and update order status
- `GET /products`, `POST /products`, `PATCH /products/:productId`,
  `DELETE /products/:productId`: catalog and inventory operations; delete
  archives the product
- `GET /customers`: list customer accounts without password hashes
- `PATCH /customers/:customerId`: activate or deactivate a customer account
- `GET /settings`, `PUT /settings`: read and update store identity, currency,
  tax, shipping, and inventory alert settings

Store settings persist in the `store_settings` table when Postgres is enabled.
The demo catalog and order collections remain in memory and reset when the API
restarts. Checkout reads the saved currency, tax rate, and flat shipping value;
successful orders decrement the in-memory catalog stock.

## Admin account database fields

When `DATABASE_URL` is configured, signup and login use the Sequelize `users`
table. Startup adds missing `role`, `isVerified`, and `isActive` columns to an
existing `users` table automatically. Without `DATABASE_URL`, the API uses an
in-memory store, so accounts created directly in Postgres are not available to
that local fallback.

The user record needs these columns:

| Column | Type | Requirements |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `name` | varchar(120) | Required |
| `email` | varchar(255) | Required, unique, lowercase |
| `passwordHash` | varchar | Required; bcrypt hash, never plaintext |
| `role` | varchar(16) | `user` or `admin`; defaults to `user` |
| `isVerified` | boolean | Required; defaults to `false` |
| `isActive` | boolean | Required; defaults to `true` |
| `createdAt`, `updatedAt` | timestamp | Required Sequelize timestamps |

The startup migration handles the additive columns. If you prefer to apply the
schema manually before restarting the backend, use the following SQL. The model
validates the role for application-created records; the database constraint
below also protects direct inserts:

```sql
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "role" varchar(16) NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS "isVerified" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isActive" boolean NOT NULL DEFAULT true;

ALTER TABLE users
  ADD CONSTRAINT users_role_check CHECK ("role" IN ('user', 'admin'));
```

Create the admin with a bcrypt hash generated from the password you intend to
use (bcrypt cost 12 is what signup currently uses). Never store a plaintext
password. Example insert, substituting the generated hash:

```sql
INSERT INTO users (id, name, email, "passwordHash", role, "isVerified", "isActive", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'Store Administrator', 'admin@example.com', '<bcrypt-hash>', 'admin', true, true, NOW(), NOW());
```

The admin frontend is selected by the hostname prefix `admin.` (for example,
`admin.example.com`); DNS and hosting must route that hostname to the frontend.
For local development, open `http://admin.localhost:5173` while Vite and the
backend are running.
The API permits the matching `admin.` origin automatically based on
`CORS_ORIGIN`; set `ADMIN_CORS_ORIGIN` explicitly if the admin frontend uses a
different domain.
