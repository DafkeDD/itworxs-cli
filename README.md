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
`messages/` (en/nl/fr/de) en een `LocaleSwitcher`. De talen pas je aan in
`src/i18n/routing.ts`.

Thema-modus (light/dark/system) zit standaard mee via een custom `ThemeProvider`
(`data-theme` + CSS-variabelen): een `ThemeProvider`, een `ThemeSwitcher` in de
header, en class-based dark mode in Tailwind. Het systeem-thema volgt automatisch de
OS-voorkeur.

```
mijn-project/
  frontend/    # Next.js + Tailwind app
  backend/     # Node.js + Express API
```

De wizard stelt nog extra vragen:

- **Database** (bij een backend) — PostgreSQL (standaard, met `pg` + `config/db.ts`)
  of geen. Bij geen database worden `db.ts` en `pg` weggelaten en krijg je een
  simpele `/health`.
- **Repository** — waar je de repo host. Bij **GitHub** komt er een
  `.github/workflows/ci.yml` (GitHub Actions) met build-jobs voor de aangemaakte
  frontend en/of backend. Daarna vraagt de wizard of je meteen een **GitHub-repo
  wil aanmaken**; zo ja, geef je een **naam** (standaard de mapnaam) en kies je
  **privé of publiek**. De repo wordt aangemaakt via de GitHub CLI (`gh`, ingelogd)
  met `origin` als remote.
- **UI/UX design-skill** (alleen bij Next.js) — optioneel de externe
  `ui-ux-pro-max` skill per project installeren via `npx uipro-cli init --ai claude`.
  Geeft design-intelligentie (stijlen, kleuren, typografie). Vereist Python 3.

Opties:

- `--frontend <naam>` — sla de frontend-vraag over (`nextjs`, `none`).
- `--database <naam>` — sla de database-vraag over (`postgresql`, `none`).
- `--repo <naam>` — repo-host (`github`, `none`).
- `--repo-create <ja|nee>` — meteen een GitHub-repo aanmaken (`yes`, `no`).
- `--repo-name <naam>` — naam van de repo (standaard: de mapnaam).
- `--repo-visibility <type>` — `private` (standaard) of `public`.
- `--design <ja|nee>` — UI/UX design-skill installeren (`yes`, `no`).
- `--backend <naam>` — sla de backend-vraag over (`node-express`, `none`).
- `--dry-run` — toont enkel wat er zou gebeuren, voert niets uit.

Start daarna:

```bash
cd frontend && npm run dev    # frontend op http://localhost:3000
cd backend  && npm run dev    # backend op http://localhost:3001
```

### Plannen & bouwen met GitHub issues

In de `.claude/`-tooling zitten twee skills voor een gefaseerde workflow (vereist de
GitHub CLI `gh`, ingelogd):

- **itworxs-plan** — verfijnt een feature, splitst ze in fases en maakt GitHub issues:
  een epic met fase-checklist + een issue per fase.
- **itworxs-ship** — bouwt fase per fase (implementeren, testen, quality-gate, commit,
  PR), vinkt taken/fases af in de issues en sluit ze. Eén checkpoint per fase.

### Claude-tooling (`.claude/`)

Elk project krijgt een `.claude/`-map met skills, expert-agents, een MCP-config en een
session-handoff. De MCP-servers worden afgestemd op je keuzes (postgres bij een database,
github bij een GitHub-repo). Beschrijvingen zijn bewust kort gehouden om de
token-overhead per sessie laag te houden.

**Skills (16)** — taakgerichte workflows:

| Skill | Doel |
|-------|------|
| `itworxs-scaffold` | Nieuwe onderdelen volgens de bestaande structuur aanmaken |
| `itworxs-component` | React/Next.js-component (Tailwind, react-icons, next-intl, a11y) |
| `itworxs-i18n` | Vertalingen toevoegen / talen synchroniseren (frontend + backend) |
| `itworxs-auth` | Veilige authenticatie (JWT/sessies + optioneel OAuth) |
| `itworxs-migrations` | Postgres-migraties (raw `pg`, geen ORM) |
| `itworxs-quality` | Quality-gate: lint, type-check, format-check, build |
| `itworxs-security` | Secrets, kwetsbare deps en ontbrekende validatie opsporen |
| `itworxs-a11y` | WCAG-toegankelijkheidscheck van de frontend |
| `itworxs-performance` | Lighthouse/Core Web Vitals + backend query-/load-knelpunten |
| `itworxs-e2e` | Playwright end-to-end tests |
| `itworxs-deploy` | Dockerfiles + docker-compose genereren |
| `itworxs-commit` | Quality-gate → conventional commit → PR via `gh` |
| `itworxs-handoff` | Session-handoff bijwerken (`.claude/HANDOFF.md`) |
| `itworxs-plan` | Feature in fases splitsen → GitHub issues (epic + issue per fase) |
| `itworxs-ship` | Plan fase per fase bouwen en de issues bijwerken/sluiten |
| `itworxs-feature` | Volledig traject van plan tot opgeleverde code |

**Agents (8)** — specialisten die in hun eigen context werken:

| Agent | Rol |
|-------|-----|
| `itworxs-explorer` | Codebase verkennen en in kaart brengen vóór een wijziging |
| `itworxs-designer` | `design.md` opstellen voor een feature |
| `itworxs-architect` | Architectuur-/onboardingdocumentatie (README + Mermaid) |
| `itworxs-developer` | Features implementeren volgens de projectpatronen |
| `itworxs-tester` | Tests schrijven (happy + failure paths) |
| `itworxs-reviewer` | Wijzigingen reviewen tegen de projectstandaarden |
| `itworxs-db-expert` | PostgreSQL: schema-ontwerp, indexen, query-optimalisatie |
| `itworxs-gdpr` | GDPR/AVG-doorlichting (EU): PII, consent, bewaartermijnen |

#### Projectgeheugen (`.claude/memory/`)

De agents delen een gecureerde kennisplek die ze **lezen** voor context en **bewust**
bijwerken — geen automatisch logboek. Drie bestanden:

| Bestand | Inhoud | Beheerd door |
|---------|--------|--------------|
| `architecture.md` | stack, structuur, beslissingen, valkuilen, db-schema | architect, explorer, db-expert |
| `domain.md` | glossarium: afkortingen en projecttermen | iedereen |
| `data-privacy.md` | PII-inventaris en privacy-aandachtspunten | gdpr |

Bij `itworxs update` worden deze bestanden **nooit overschreven** (seed-once): je
gecureerde inhoud blijft staan, net als je `HANDOFF.md`.

#### Token-zuinig

Het sjabloon is afgesteld op laag tokenverbruik:

- **MCP**: standaard alleen `context7` + `gitnexus` (+ `postgres`/`github` indien gekozen).
  De zwaardere `playwright`-MCP staat uit en zet je opt-in aan voor e2e (zie itworxs-e2e).
- **Modelkeuze**: lichte agents (explorer, tester, reviewer, db-expert, gdpr) draaien op
  Haiku; zwaar denkwerk (developer, architect, designer) op het standaardmodel.
- **Minder agent-hops**: de explorer wordt alleen ingezet bij grote/onbekende fases; voor
  kleine fases gaat de developer er direct op, leunend op `memory/architecture.md`.
- **Gericht lezen**: agents gebruiken grep en lezen alleen relevante regels, geen mappen.

### Bestaand project bijwerken

Draai in de root van een bestaand project:

```bash
npx github:DafkeDD/itworxs-cli update
```

Dit ververst de `.claude/`-tooling (skills, agents, MCP-config, session-handoff) naar
de laatste versie en raakt je `frontend/`/`backend/`-code niet aan. De CLI detecteert
zelf of er een PostgreSQL- en/of GitHub-setup is en stemt de MCP-servers daarop af.
Je eigen `.claude/HANDOFF.md` blijft behouden.

### Andere commands

```bash
npx github:DafkeDD/itworxs-cli help       # toon hulp
npx github:DafkeDD/itworxs-cli version    # toon versie
```

## Ontwikkelen aan de CLI zelf

```bash
git clone https://github.com/DafkeDD/itworxs-cli.git
cd itworxs-cli

npm install            # installeert deps
npm run build          # bouwt dist/ (wordt mee gecommit)
npm run typecheck      # alleen types controleren
node dist/cli.js help  # lokaal draaien
```

## Structuur

```
src/cli.ts             # entrypoint (argument parsing)
src/commands/init.ts   # init command (wizard + frontend install)
dist/                  # build-output (mee gecommit, zodat npx werkt)
templates/claude/      # .claude-tooling (skills, agents, scripts) voor projecten
tsup.config.ts         # bundler-config
tsconfig.json          # TypeScript-config
package.json           # bin-veld maakt 'itworxs' command aan
```

## Een nieuwe vraag/optie toevoegen

De wizard zit in `src/commands/init.ts` (met `@clack/prompts`). Voeg een optie toe
aan `FRONTENDS`, of voeg een extra `p.select` / `p.text` stap toe. Daarna `npm run build`.

## Licentie

MIT
