---
name: itworxs-auth
description: Veilige authenticatie in de Express-backend: JWT/sessies en optioneel OAuth (Google, Microsoft, Azure, GitHub) via JWT_SECRET/OAUTH_*. Gebruik voor login of beveiligde routes.
---

# ItWorXs Auth

Bouw authenticatie in de Express + TypeScript backend, in lijn met de bestaande config
(`config/env.ts`, `.env.example`).

## JWT / sessies

- Gebruik `JWT_SECRET` uit de env (laat de app falen als die ontbreekt in productie).
- Hash wachtwoorden met `bcrypt` of `argon2` — nooit plain opslaan.
- Geef tokens een korte levensduur; overweeg refresh-tokens. Bewaar ze veilig (httpOnly + secure cookies waar mogelijk).
- Maak een auth-middleware (`middleware/auth.ts`) die het token valideert en `req.user` zet; bescherm routes daarmee.

## OAuth (optioneel)

- Gebruik de `OAUTH_*`-variabelen voor de gekozen providers (zie `config/auth.ts` indien aanwezig).
- Redirect-flow via `OAUTH_REDIRECT_BASE`; valideer de `state`-parameter (CSRF-bescherming).

## Beveiliging

- Valideer alle input; geef geen detail prijs bij login-fouten (niet "gebruiker bestaat niet").
- Rate-limit login en registratie; respecteer `TRUST_PROXY` voor de echte client-IP.
- CORS met credentials enkel naar `FRONTEND_URL` (geen wildcard).
- Geen secrets of tokens in logs.

## Frontend

- Stuur credentials mee (`credentials: 'include'`); toon de login-state via next-intl-teksten.

Zet nooit echte secrets in code of git — alles via environment-variabelen.
