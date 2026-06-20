# itworxs-cli

Basis CLI voor ItWorXs projecten, geschreven in **TypeScript** (gebundeld met `tsup`).
Per project te gebruiken — **zonder iets te installeren** in je project.

## Gebruik

Draai dit in de root van je project:

```bash
npx github:DafkeDD/itworxs-cli init
```

De CLI wordt tijdelijk opgehaald van GitHub (in de npx-cache, **niet** in je
project) en draait meteen. Je project blijft dus volledig schoon — er komt geen
`node_modules` of `package.json` van de CLI in te staan.

### `init`

`init` vraagt welke frontend je wil gebruiken:

```
Welke frontend wil je gebruiken?

  1) Next.js + TailwindCSS (laatste versie)

Keuze [1]:
```

Bij keuze 1 draait de CLI `create-next-app@latest` (dus altijd de nieuwste
Next.js + TailwindCSS) en zet die in een map **`frontend/`** in je projectroot:

```
mijn-project/
  frontend/     # de Next.js + Tailwind app
```

Daarna start je de frontend met:

```bash
cd frontend
npm run dev
```

### Andere commands

```bash
npx github:DafkeDD/itworxs-cli help       # toon hulp
npx github:DafkeDD/itworxs-cli version    # toon versie
npx github:DafkeDD/itworxs-cli init --dry-run   # toon enkel het commando
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
