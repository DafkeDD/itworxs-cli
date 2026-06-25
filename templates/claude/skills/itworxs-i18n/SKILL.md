---
name: itworxs-i18n
description: Voeg vertalingen toe of synchroniseer talen (next-intl frontend + backend op dezelfde talenlijst). Gebruik bij een nieuwe taal, vertaalsleutel of ontbrekende vertalingen.
---

# ItWorXs i18n

Beheer de meertaligheid van het project. Deze bronnen moeten in sync blijven:

- `frontend/src/i18n/routing.ts` — de lijst `locales` en `defaultLocale`.
- `frontend/messages/<taal>.json` — de vertaalde teksten per taal.
- `backend/src/config/locale.ts` — `SUPPORTED_LOCALES` (indien een backend aanwezig is).

## Een taal toevoegen

1. Voeg de taalcode toe aan `locales` in `routing.ts`.
2. Voeg dezelfde code toe aan `SUPPORTED_LOCALES` in `backend/src/config/locale.ts` (indien aanwezig).
3. Maak `frontend/messages/<taal>.json` met dezelfde sleutels als `en.json`, vertaald.
4. De `LocaleSwitcher` toont de nieuwe taal automatisch (hij leest `routing.locales`).

## Een vertaalsleutel toevoegen

1. Voeg de sleutel toe aan ALLE `frontend/messages/*.json` (gebruik `en.json` als referentie).
2. Gebruik de sleutel in een component via `useTranslations('namespace')`.

## Ontbrekende vertalingen opsporen

- Vergelijk de sleutels van elke `messages/*.json` met `en.json`; rapporteer per taal wat ontbreekt of teveel is.
- Controleer dat `routing.ts` en `backend/src/config/locale.ts` exact dezelfde talen bevatten.

Gebruik nooit hardcoded UI-teksten in code; alles loopt via next-intl.
