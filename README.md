# itworxs-cli

Basis CLI voor ItWorXs projecten, geschreven in **TypeScript** (gebundeld met `tsup`).
Wordt **per project** geïnstalleerd (niet globaal).

## Installeren in een project

Om de projectroot schoon te houden, installeer je de CLI in een eigen submap
`itworxs-cli/`. Daar belanden `node_modules` en de `package*.json` — niet in de
root van je project.

```bash
# vanuit de root van je project
mkdir itworxs-cli
cd itworxs-cli
npm init -y
npm install --save-dev github:DafkeDD/itworxs-cli
```

Of in één keer (PowerShell), vanuit je projectroot:

```powershell
New-Item -ItemType Directory -Force itworxs-cli > $null
Push-Location itworxs-cli
npm init -y > $null
npm install --save-dev github:DafkeDD/itworxs-cli
Pop-Location
```

## Gebruik

```bash
cd itworxs-cli
npx itworxs help       # toon hulp
npx itworxs version    # toon versie
npx itworxs init       # initialiseer het project
```

Op dit moment is `init` een lege stub: het bevestigt enkel de initialisatie en
raakt nog geen bestanden aan. Vul je eigen logica in via `src/commands/init.ts`.

## Ontwikkelen aan de CLI zelf

```bash
git clone https://github.com/DafkeDD/itworxs-cli.git
cd itworxs-cli

npm install            # installeert deps + bouwt dist (prepare-script)
npm run build          # eenmalig bouwen
npm run dev            # bouwen in watch-mode
npm run typecheck      # alleen types controleren
node dist/cli.js help  # lokaal draaien
```

## Structuur

```
src/cli.ts             # entrypoint (argument parsing)
src/commands/init.ts   # init command (nu nog een stub)
dist/                  # build-output (gegenereerd, niet in git)
tsup.config.ts         # bundler-config
tsconfig.json          # TypeScript-config
package.json           # bin-veld maakt 'itworxs' command aan
```

## Een nieuw command toevoegen

1. Maak `src/commands/<naam>.ts` met een geëxporteerde functie.
2. Importeer en koppel het in `src/cli.ts` in de `switch`.
3. `npm run build`.

## Licentie

MIT
