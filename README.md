# SHOP.CO Admin Panel

Standalone admin dashboard for the [ecommerce-website](../ecommerce-website) storefront. Deployed
and versioned separately from the storefront, but talks to the same backend API.

## Stack

- React 19 + React Router
- Tailwind CSS v4
- Vite

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your backend (defaults to prod backend in build)
npm run dev
```

Log in with an existing admin account (role `admin`) from the ecommerce-website's user database —
this app has no signup page, it only manages access for accounts that already exist.

## Deploy

Deploy as its own Vercel project (Root Directory = repo root of this project). Set the
`VITE_API_URL` environment variable in Vercel to the deployed backend URL if it differs from the
default in `src/config/api.js`.
