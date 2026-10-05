# Gifting Platform

Full-stack gifting storefront with a React/Vite frontend and Express API.

## Run locally

Start the API in one terminal:

```bash
cd backend
npm install
npm run dev
```

Start the storefront in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The admin workspace is available at
`http://admin.localhost:5173`.

The frontend build requires Node.js 20.19+ or 22.12+; use Node 24 for the
current Vite toolchain. Set `DATABASE_URL` in the backend environment for
durable commerce and account data. Without it, the API uses process memory for
local development and tests.

Run API integration tests with `cd backend && npm test`. More configuration and
email delivery details are in [backend/README.md](backend/README.md).

Payment-provider integration is not configured. Checkout records orders as
awaiting payment; do not accept or advertise live payments until a provider is
added and verified.
