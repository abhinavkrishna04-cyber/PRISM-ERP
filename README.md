# P.R.I.S.M. ERP System
*(Protected Resource Integration System for Management)*

This is a complete rebuild of the PRISM ERP system generated directly from the master prompt specifications, completed start to finish.

## Tech Stack
- Frontend: React 18, Vite, Tailwind CSS v4, Framer Motion, Chart.js
- Backend: Node.js, Express
- Database: PostgreSQL (neon.tech)
- Auth: JWT + bcrypt

## Features Integrated
- Dynamic Module System (Inventory, Finance, Employees, Settings)
- Deep Dark "Prism Theme" with Glassmorphism
- Smooth Framer Motion transitions
- Data Loss Prevention (DLP) Logging API and Middleware integrated into the Express Router.

## Setup Instructions
1. Ensure `node` is available (we recommend v20+).
2. Inside `backend`, add your PostgreSQL connection URL to `.env`.
3. Run `node init-db.js` then run `node seed.js` in the `backend` folder to set up schema and demo data.
4. Run `npm install` and `npm start` (or `node server.js`) in `backend`.
5. Run `npm install` and `npm run dev` in `frontend`.
