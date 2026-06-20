# itworxs-cli

Basis CLI voor ItWorXs projecten, geschreven in **TypeScript** (gebundeld met `tsup`).
Per project te gebruiken via **npx** — rechtstreeks van GitHub, zonder iets te
installeren in je project.

## Gebruik

Draai dit in de root van je project:

```bash
npx github:DafkeDD/itworxs-cli init
```

Dat is alles. De CLI wordt tijdelijk van GitHub gehaald (in de npx-cache, **niet**
in je project) en de setup-wizard start meteen. Je project blijft volledig schoon —
er komt geen `node_modules` of `package.json` van de CLI in te staan.

### `init`

`init` start een interactieve wizard met twee vragen: **frontend** en **backend**.

```
┌   itworxs  project setup
│
◆  Welke frontend wil je gebruiken?
│  ● Next.js   met TailwindCSS, laatste versie
│  ○ Geen
│
◆  Welke backend wil je gebruiken?
│  ● Node.js + Express   basis API-server
│  ○ Geen
└
```

Op basis van je keuzes zet de CLI dit op in je projectroot (geen extra
bevestiging — het draait meteen):

| Keuze | Resultaat |
|-------|-----------|
| **Next.js** | map `frontend/` via `create-next-app@latest` (Next.js + TailwindCSS, TypeScript), **next-intl** (i18n: en/nl/fr/de), **dark/light/system** thema (custom, `data-theme`) + Prettier |
| **Node.js + Express** | map `backend/` met een **TypeScript** Express-server (`tsx` + `tsc`), **PostgreSQL** (`pg`) in `config/db.ts`, `config/env.ts`, `services/logger.ts` (pino), `.env.example` + Prettier. `src/` bevat: config, controllers, data, middleware, modals, routes, services |

De Next.js-frontend wordt meteen meertalig opgezet met **next-intl**: een
`[locale]/` route, `src/i18n/` config, een `proxy.ts`, message-bestanden in
`src/messages/` (en/nl/fr) en een `LocaleSwitcher`. De talen pas je aan in
`src/i18n/routing.ts`.

Thema-modus (light/dark/system) zit standaard mee via een custom `ThemeProvider` (`data-theme` + CSS-variabelen): een
`ThemeProvider`, een `ThemeSwitcher` in de header, en class-based dark mode in
Tailwind. Het systeem-thema volgt automatisch de OS-voorkeur.

```
mijn-project/
  frontend/    # Next.js + Tailwind app
  backend/     # Node.js + Express API
```

Opties:

- `--frontend <naam>` — sla de frontend-vraag over (`nextjs`, `none`).
- `--backend <naam>` — sla de backend-vraag over (`node-express`, `none`).
- `--dry-run` — toont enkel wat er zou gebeuren, voert niets uit.

Start daarna:

```bash
cd frontend && npm run dev    # frontend op http://localhost:3000
cd backend  && npm run dev    # backend op http://localhost:3001
```

### Andere commands

```bash
npx github:DafkeDD/itworxs-cli help       # toon hulp
npx github:DafkeDD/itworxs-cli version    # toon versie
```

## Ontwikkelen aan de CLI zelf

```bash
git clone https://github.com/DafkeDD/itworxs-cli.git
cd itworxs-cli

npm install            # installeert deps + bouwt dist (prepare-script)
npm run build          # eenmalig bouwen
npm run typecheck      # alleen types controleren
node dist/cli.js help  # lokaal draaien
```

## Structuur

```
src/cli.ts             # entrypoint (argument parsing)
src/commands/init.ts   # init command (wizard + frontend install)
dist/                  # build-output (gegenereerd, niet in git)
tsup.config.ts         # bundler-config
tsconfig.json          # TypeScript-config
package.json           # bin-veld maakt 'itworxs' command aan
```

## Een nieuwe vraag/optie toevoegen

De wizard zit in `src/commands/init.ts` (met `@clack/prompts`). Voeg een optie toe
aan `FRONTENDS`, of voeg een extra `p.select` / `p.text` stap toe. Daarna `npm run build`.

## Licentie

MIT
