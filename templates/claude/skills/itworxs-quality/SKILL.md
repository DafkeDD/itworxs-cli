---
name: itworxs-quality
description: Kwaliteitspoort voor een ItWorXs-project. Lint, type-check, formatteer-check en build van de frontend (Next.js) en backend (Express). Gebruik dit voor een commit of pull request, of wanneer de gebruiker vraagt om de code te controleren.
---

# ItWorXs Quality Gate

Voer de kwaliteitscontroles uit voor de onderdelen die in dit project aanwezig zijn.
Detecteer of er een `frontend/` en/of `backend/` map bestaat en draai de relevante
stappen per map. Dit is een controle-skill: wijzig geen code zonder te vragen.

## Frontend (`frontend/`)

1. `npm run lint` — ESLint
2. `npx tsc --noEmit` — type-check
3. `npx prettier --check .` — formattering
4. `npm run build` — Next.js build

## Backend (`backend/`)

1. `npm run typecheck` (of `npx tsc --noEmit`) — type-check
2. `npx prettier --check .` — formattering
3. `npm run build` — TypeScript build (tsc)

## Werkwijze

- Draai elke stap; stop niet bij de eerste fout, maar verzamel alle fouten per
  onderdeel zodat de gebruiker in één keer kan bijsturen.
- Vat het resultaat kort samen: per onderdeel een duidelijke "geslaagd" of een
  lijst met de concrete fouten (bestand + regel + boodschap).
- Stel waar nuttig een gerichte fix voor, maar pas niets toe zonder akkoord.
