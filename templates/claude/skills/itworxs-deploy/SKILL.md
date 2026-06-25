---
name: itworxs-deploy
description: Genereer deployment-bestanden voor een ItWorXs-project — een Dockerfile voor de Next.js-frontend en de Express-backend, plus een docker-compose. Gebruik wanneer het project klaar is om te containeriseren of te deployen.
---

# ItWorXs Deploy

Maak productie-klare containerisatie voor de aanwezige onderdelen. Volg de bestaande
structuur (`frontend/`, `backend/`). Vraag bevestiging voor je bestanden aanmaakt.

## Frontend (Next.js) — `frontend/Dockerfile`

- Multi-stage build met `node:20-alpine`: builder draait `npm ci` + `npm run build`.
- Gebruik de standalone output van Next.js (zet `output: 'standalone'` in `next.config.ts`).
- De runtime-stage kopieert `.next/standalone`, `.next/static` en `public`, en draait `node server.js` op poort 3000.

## Backend (Express) — `backend/Dockerfile`

- Multi-stage: de builder draait `npm ci` + `npm run build` (tsc → `dist/`).
- De runtime-stage installeert enkel productie-dependencies en draait `node dist/index.js` op poort 5000.

## Orkestratie — `docker-compose.yml` (projectroot)

- Services voor `frontend`, `backend` en (indien gebruikt) `postgres` (`postgres:16-alpine`).
- Env via een `.env` (niet committen). Zet `FRONTEND_URL` en de `DB_*`-variabelen correct.
- Voeg healthchecks toe; laat de backend wachten tot de database gezond is.

## Checklist

- Een `.dockerignore` per map (sluit `node_modules`, `.env`, `dist`, `.next` uit).
- Geen secrets in de images; alles via environment-variabelen.
- Test lokaal met `docker compose up --build` en controleer `/` (frontend) en `/health` (backend).
