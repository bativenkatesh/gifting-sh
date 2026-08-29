# Backend (Express MVC)

This folder contains a minimal Express backend scaffolded with an MVC-like pattern suitable for production.

Quick start

1. Install dependencies

```bash
cd backend
npm install
```

2. Copy `.env.example` to `.env` and adjust values

3. Run in development

```bash
npm run dev
```

4. Run in production

```bash
npm start
```

Notes
- Use a process manager like `pm2` or a container runtime for production deployments.
- Add database integration under `src/models` and expand controllers accordingly.
