---
name: itworxs-e2e
description: Schrijf en draai Playwright e2e-tests voor de Next.js-frontend (navigatie, taalwissel, thema, formulieren).
---

# ItWorXs E2E (Playwright)

End-to-end tests voor de frontend met Playwright. Dit sluit aan op de
playwright-MCP die in dit project geconfigureerd is.

## Opzet (eenmalig)

- In `frontend/`: `npm init playwright@latest` (of `npm i -D @playwright/test` gevolgd door `npx playwright install`).
- Plaats tests in `frontend/e2e/`.
- Start de dev-server (`npm run dev`) of gebruik de `webServer`-optie in `playwright.config`.

## Wat testen

- **Navigatie**: de homepage laadt en toont de welkomsttekst.
- **i18n**: taal wisselen via de `LocaleSwitcher` verandert de teksten (de URL blijft schoon door `localePrefix: 'never'`).
- **Thema**: light/dark/system wisselen past de pagina aan.
- **Flows**: belangrijke formulieren en knoppen werken — zowel het happy path als foutgevallen.

## Aanpak

- Eén gebruikersflow per test, met beschrijvende namen.
- Gebruik toegankelijke selectors (rollen en labels) in plaats van broze CSS-selectors.
- Draai met `npx playwright test`; rapporteer faalpunten met een screenshot of trace.
