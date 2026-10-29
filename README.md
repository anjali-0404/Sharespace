# ShareSpace

A full-stack resource-sharing platform for campuses and communities. Built with React, TypeScript, Tailwind CSS, Framer Motion, and Express.

## Features

- **Authentication** — Sign up / sign in with secure password hashing (scrypt). Demo accounts pre-seeded.
- **Resource catalog** — Browse 3D printers, GPU workstations, seminar rooms, lab equipment, podcast studios, and laser cutters with real images.
- **Booking system** — Request slots, join ranked waitlists, fair-use weekly caps.
- **Owner console** — Approve/reject requests, check-out, confirm returns, report damage, reset demo data.
- **Audit trail** — Every action logged with timestamps.
- **Design** — Aceternity/21st.dev-inspired effects: aurora backgrounds, dot-grid patterns, meteor effects, spotlight cards (dark surfaces), 3D tilt cards, gradient text, count-up stats, animated nav indicators.

## Run

```bash
npm install
npm run dev      # API on :3001 + Vite dev on :5173
# or production:
npm run build && npm run api   # everything on http://localhost:3001
```

## Demo accounts

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Student | demo@sharespace.io     | demo1234    |
| Owner   | owner@sharespace.io    | owner1234   |

Or create a new account from the login screen.

## Structure

```
shared/resources.json   Resource catalog (shared by API + UI), includes image URLs
server/index.js         Express API: auth, bookings, certs, owner actions, audit log
src/store.tsx           Auth + API-backed state (polls every 4s, JWT-like token in localStorage)
src/fx.tsx              Aceternity-style effects (aurora, spotlight, beams, tilt, count-up, gradient text, meteors)
src/ui.tsx              Base components (Button, Card with spotlight, Badge)
src/App.tsx             All pages: auth screen, home, explore, detail, dashboard, owner console, activity log
src/index.css           Tailwind + custom utilities (grid patterns, glassmorphism, scrollbar, reduced-motion)
```

## Auth flow

- Passwords hashed with Node `crypto.scryptSync` (salt + hash stored in `db.json`).
- Token is a base64-encoded JSON payload (uid, name, email, role) — no external JWT library needed.
- Frontend stores token in `localStorage` and sends it as `Authorization: Bearer <token>`.
- Owner-only endpoints check the token's role (or `x-role` header for the demo "View as" toggle).
- `POST /api/reset` (owner only) restores seed data and demo accounts.
