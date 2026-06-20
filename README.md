# itworxs-cli

Basis CLI voor ItWorXs projecten, geschreven in **TypeScript** (gebundeld met `tsup`).
Wordt **per project** geïnstalleerd (niet globaal).

## Installeren in een project

Installeer de CLI in een eigen submap `itworxs-cli/` zodat de projectroot schoon
blijft (`node_modules` en `package*.json` komen in die submap, niet in de root).

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

Draai de commands vanuit de `itworxs-cli` map:

```bash
cd itworxs-cli
npx itworxs init       # zet een frontend op (vraagt welke je wil)
npx itworxs help       # toon hulp
npx itworxs version    # toon versie
```

### `init`

`init` vraagt welke frontend je wil gebruiken en zet die op:

```
Welke frontend wil je gebruiken?

  1) Next.js + TailwindCSS (laatste versie)

Keuze [1]:
```

Bij keuze 1 draait de CLI `create-next-app@latest` (dus altijd de nieuwste
Next.js + TailwindCSS) en installeert die in een map **`frontend/`** in je
projectroot:

```
mijn-project/
  itworxs-cli/     # de CLI-install
  frontend/        # de Next.js + Tailwind app
```

> Draai je `init` vanuit de `itworxs-cli` map, dan komt `frontend/` in de map
> erboven (de projectroot). Draai je het ergens anders, dan in de huidige map.

Opties:

- `--dry-run` — toont enkel het commando dat gedraaid zou worden, voert niets uit.

Daarna start je de frontend met:

```bash
cd frontend
npm run dev
```

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
src/commands/init.ts   # init command (frontend-prompt + install)
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
