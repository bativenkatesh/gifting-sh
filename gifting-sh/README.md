# Gifting E-Commerce Platform

A full-stack gifting e-commerce platform with a modern React Material-UI frontend and an Express.js MVC backend.

---

## 📁 Project Structure

```
gifting-sh/
├── package.json              # Monorepo scripts
├── README.md                 # Project guide
├── frontend/                 # React + Vite + Material UI application
│   ├── src/                  # React components, pages, styles
│   ├── components/           # Home & Custom Gift Box Builder
│   └── package.json
└── backend/                  # Node.js + Express.js MVC backend
    ├── src/
    │   ├── controllers/      # MVC Controllers (auth, products, cart, orders, health)
    │   ├── models/           # MVC Models (user, product, cart, order)
    │   ├── routes/           # Versioned API routes (/api/v1/*)
    │   ├── middlewares/      # JWT auth, error handler, rate limiters
    │   ├── config/           # Environment configuration
    │   ├── constants/        # HTTP status codes
    │   ├── data/             # Seed catalogs (boxes, builder options)
    │   └── utils/            # ApiError, ApiResponse, asyncHandler
    ├── .env
    ├── .env.example
    └── package.json
```

---

## 🚀 Quick Start

### 1. Run Backend
```bash
cd backend
npm install
npm run dev
```
Backend API will be running on `http://localhost:5000`.

### 2. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend client will be running on `http://localhost:5173`.

---

## 🧪 Testing the Backend API
```bash
cd backend
node test-api.js
```

