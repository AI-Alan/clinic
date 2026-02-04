# Clinic Management System

Personal clinic management for a single doctor. Next.js (App Router), MongoDB (Mongoose), JWT in httpOnly cookies, Tailwind CSS.

## Setup

1. **Env**  
   Copy `.env.example` to `.env.local` (or use existing `.env` keys). Set:
   - `MONGODB_URI` – e.g. `mongodb://localhost:27017/clinic`
   - `JWT_SECRET` – secret for JWT (use existing value if present)

2. **Install and seed**
   ```bash
   npm install
   npm run db:seed
   ```
   Seeds doctor: **doctor@clinic.com** / **123456**

3. **Run**
   ```bash
   npm run dev
   ```
   Open **http://localhost:3000**. Log in with the seeded doctor.

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Next.js dev server       |
| `npm run build`| Production build         |
| `npm start`    | Run production build     |
| `npm run db:seed` | Seed doctor (idempotent) |

## Structure

- **app/** – Routes (login, dashboard, patients, patients/[id]), API routes, layout, globals
- **components/** – Layout, PatientForm, VisitForm, VisitTimeline
- **lib/** – DB connection, auth (JWT, cookies)
- **models/** – Mongoose: Doctor, Patient, Visit
- **scripts/seed.js** – Seeds single doctor account
- **middleware.ts** – Protects all routes except `/login`; protects API except login/logout

## Deployment

1. Set production env (e.g. on host): `MONGODB_URI` (e.g. MongoDB Atlas URI), `JWT_SECRET` (strong random secret).
2. Build and start: `npm run build && npm start`.
3. Optional: run `npm run db:seed` once against the production DB to create the initial doctor (or use existing credentials).
4. All routes except `/login` and `/login/forgot` require auth; API routes (except login/logout) require a valid JWT cookie.

## API

- `POST /api/auth/login` – body: `{ email, password }`
- `POST /api/auth/logout`
- `GET /api/patients` – optional `?search=`, filters, pagination
- `POST /api/patients` – body: patient fields
- `GET/PUT/DELETE /api/patients/[id]`
- `GET /api/visits?patientId=...`
- `POST /api/visits` – body: patientId, date, symptoms, diagnosis, medicines[], notes
