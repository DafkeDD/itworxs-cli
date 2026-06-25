---
name: itworxs-security
description: Security-check: secrets in code, kwetsbare dependencies en ontbrekende validatie. Gebruik voor een release of een security-controle.
---

# ItWorXs Security Check

Voer een lichte beveiligingsdoorlichting uit. Wijzig niets zonder te vragen;
rapporteer bevindingen met locatie en een voorstel.

## Secrets

- Scan de broncode (niet `node_modules`) op hardcoded API-keys, wachtwoorden, tokens of connection strings.
- Controleer dat `.env` in `.gitignore` staat en niet gecommit is; enkel `.env.example` hoort in git.
- Controleer dat `.env.example` geen echte waarden bevat.

## Dependencies

- Draai `npm audit` in `frontend/` en `backend/` en vat de hoge/kritieke bevindingen samen.
- Wijs op duidelijk verouderde of niet-onderhouden packages.

## Backend (Express)

- Controleer dat externe input gevalideerd wordt voor gebruik.
- Controleer dat DB-queries geparametriseerd zijn (geen string-concatenatie in SQL).
- Controleer de CORS-config: `origin` beperkt tot `FRONTEND_URL`, geen wildcard in combinatie met credentials.
- Fouten mogen geen interne details of stacktraces naar de client lekken.

## Rapport

Geef per categorie: in orde, of een lijst met concrete risico's (bestand + regel) en een voorgestelde fix.
