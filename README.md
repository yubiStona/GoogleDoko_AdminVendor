# GoogleDoko Admin & Vendor Portal

This repository contains the dedicated admin and vendor web app. It uses the existing GoogleDoko backend and database; it does not create a second user store.

## Local development

1. Start the backend API on port `4000`.
2. Copy `.env.example` to `.env`. Leave `VITE_API_URL` empty for local development; the Vite proxy sends `/api` and `/uploads` requests to `http://127.0.0.1:4000`. `VITE_STOREFRONT_URL` points the login pages' “Back to GoogleDoko” link to the customer landing page.
3. Run `npm install`, then `npm run dev`. The portal runs on `http://localhost:5174`.
4. Run the customer storefront on `http://localhost:5173`; its vendor/admin entry points open this portal.

Vendor registration is available at `/signup/vendor`; vendor sign-in is `/login?role=vendor`; admin sign-in is `/admin/login`. Admin and vendor API routes remain protected by backend role checks.

## Production connection

Deploy this app to the admin subdomain (for example, `admin.<your-domain>`), with SPA fallback enabled so deep links such as `/admin/products` and `/vendor/orders` load the app. Set `VITE_API_URL` to the production backend API origin and `VITE_STOREFRONT_URL` to the customer site's landing page at build time. If `VITE_STOREFRONT_URL` is unset, the app derives the customer domain by removing the `admin.` prefix. Add the exact portal origin to the backend `ALLOWED_ORIGINS` environment variable. Keep the backend's admin and vendor role middleware enabled; hiding the UI in a separate repo is not an authorization boundary.
