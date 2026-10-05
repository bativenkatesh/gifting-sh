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

Signup returns a JWT when email verification is not configured. In production,
set `EMAIL_WEBHOOK_URL` to require verification; login is then blocked for
accounts that have not verified. Password hashes are never included in
responses. `POST /api/v1/auth/verify-email` consumes the emailed one-time link.
Password recovery uses `POST /api/v1/auth/password-reset/request` and
`POST /api/v1/auth/password-reset/confirm`; reset requests return a generic
response whether or not the account exists.
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
- `GET /coupons`, `POST /coupons`, `DELETE /coupons/:code`: manage checkout discounts
- `GET /reviews`, `PATCH /reviews/:reviewId`: moderate customer-submitted reviews
- `GET /settings`, `PUT /settings`: read and update store identity, currency,
  tax, shipping, and inventory alert settings

Store settings persist in `store_settings`. Products, carts, orders, customer
addresses, wishlists, reviews, coupons, newsletter consent, action tokens, and
order notifications persist in `commerce_records` when `DATABASE_URL` is set.
Without a database, the same APIs run against process memory and data resets
when the API restarts. Checkout quotes and order creation share server-side
currency, tax, shipping, stock, and coupon calculations. Shipped status requires
a tracking number. Order detail access is restricted to the owner or an admin.

Set `EMAIL_WEBHOOK_URL` to a trusted service that accepts JSON `{ to, subject,
text }` POST requests. Optionally set `EMAIL_WEBHOOK_TOKEN` for a Bearer token
and `FRONTEND_URL` for verification/reset links. In production signup fails
closed if email delivery is not configured. Order status messages are recorded
in-app and forwarded through the same webhook when configured. The webhook is
an integration point; no mail provider is bundled.

Admin product images may be uploaded as PNG, JPEG, WebP, or GIF files up to
2 MB. Image data is stored with product records; for larger catalogs, replace
this bounded data-URL storage with object storage.

Checkout currently creates an order in `pending_payment` state. Payment
provider integration is intentionally not included.

## Admin account database fields

When `DATABASE_URL` is configured, signup and login use the Sequelize `users`
table. Startup adds missing `role`, `isVerified`, `requiresEmailVerification`,
and `isActive` columns to an existing `users` table automatically. Without `DATABASE_URL`, the API uses an
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
| `requiresEmailVerification` | boolean | Required; defaults to `false` |
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
  ADD COLUMN IF NOT EXISTS "requiresEmailVerification" boolean NOT NULL DEFAULT false,
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
