---
name: itworxs-performance
description: Performance-check: Lighthouse/Core Web Vitals (frontend) en query-/load-knelpunten (backend). Gebruik voor een release of bij traagheid.
---

# ItWorXs Performance

Spoor performanceproblemen op en stel concrete verbeteringen voor. Wijzig niets zonder te vragen.

## Frontend (Next.js)

- Draai een productiebuild (`npm run build`) en bekijk de bundle-output; wijs op grote chunks.
- Controleer de Core Web Vitals (LCP, CLS, INP). Gebruik waar mogelijk de playwright-MCP of Lighthouse.
- Afbeeldingen via `next/image`; lazy-load wat niet boven de vouw staat.
- Gebruik server components waar geen interactie nodig is; beperk `'use client'`.
- Vermijd onnodige re-renders en zware client-side libraries.

## Backend (Express)

- Identificeer trage endpoints; onderzoek de DB-queries met `EXPLAIN (ANALYZE)` (zie de itworxs-db-expert agent).
- Let op N+1-queries, ontbrekende indexen en onnodig grote payloads.
- Voeg waar zinvol caching toe en zet paginatie op lijst-endpoints.
- Hergebruik de pg-pool; open geen connectie per request.

## Output

Een korte lijst met de grootste winsten eerst: per item het probleem, de impact en een concrete fix.
