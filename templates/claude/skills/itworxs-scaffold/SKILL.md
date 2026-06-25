---
name: itworxs-scaffold
description: Genereer snel nieuwe onderdelen in een ItWorXs-project volgens de bestaande structuur — een backend-route met controller en service, of een frontend-pagina of component. Gebruik wanneer de gebruiker iets nieuws wil aanmaken.
---

# ItWorXs Scaffold

Maak nieuwe onderdelen die passen bij de projectconventies. Volg de bestaande
mappenstructuur en stijl (de Prettier-config van het project, geen `any`, named exports).

## Backend — nieuwe resource (Express + TypeScript)

Voor een resource `x`:

- `backend/src/routes/x.routes.ts` — definieert de Express-router en koppelt endpoints aan de controller.
- `backend/src/controllers/x.controller.ts` — handelt requests af, valideert input, roept de service aan.
- `backend/src/services/x.service.ts` — bevat de logica en DB-toegang (via de pool uit `config/db`).

Registreer de router in `src/index.ts` met bijvoorbeeld `app.use('/x', xRouter)`.
Gebruik relatieve imports met `.js`-extensie (NodeNext), valideer input en log fouten via de logger.

## Frontend — nieuwe pagina (Next.js App Router)

- Maak `frontend/src/app/[locale]/<pad>/page.tsx`.
- Server component; gebruik `useTranslations` en `setRequestLocale(locale)` bovenaan.
- Teksten via next-intl (voeg de sleutels toe aan `messages/*.json`).

## Frontend — nieuw component

- Maak `frontend/src/components/<Naam>.tsx`.
- Voeg `'use client'` enkel toe als er interactiviteit of hooks nodig zijn.
- Styling met Tailwind; iconen via `react-icons`.

Draai nadien de quality-gate (itworxs-quality) om alles te valideren.
