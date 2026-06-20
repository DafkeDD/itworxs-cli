# itworxs-cli

Basis CLI voor ItWorXs projecten, geschreven in **TypeScript** (gebundeld met `tsup`).
Wordt **per project** geïnstalleerd (niet globaal), met een `init` command dat de
huidige map scaffold.

> Deze package leeft in de submap `itworxs-cli/` van de repo, zodat de root van het
> project schoon blijft (geen `node_modules`, `package-lock.json` of `package.json`
> op de root).

## Installeren in een project

Omdat `package.json` in een submap staat, werkt `npm install github:DafkeDD/itworxs-cli`
niet rechtstreeks. Gebruik een van deze routes:

### Optie A — via npm registry (aanbevolen)

Eenmalig publiceren vanuit de package-map:

```bash
cd itworxs-cli
npm publish        # evt. 'npm publish --access public' voor een scoped/publieke package
```

Daarna in elk project:

```bash
npm install --save-dev itworxs-cli
npx itworxs init
```

### Optie B — lokaal pad (handig om te testen)

```bash
npm install --save-dev "C:\pad\naar\ItWorXs-CLI\itworxs-cli"
npx itworxs init
```

## Gebruik

```bash
npx itworxs help          # toon hulp
npx itworxs version       # toon versie
npx itworxs init          # scaffold huidige map
npx itworxs init --force  # overschrijf bestaande bestanden
```

### Wat doet `init`?

Het kopieert een basis projectstructuur naar de map waar je het draait:

```
README.md
.gitignore
src/index.js
```

Bestaande bestanden worden overgeslagen, tenzij je `--force` gebruikt. De placeholder
`{{PROJECT_NAME}}` wordt vervangen door de naam van de huidige map.

## Ontwikkelen aan de CLI zelf

```bash
git clone https://github.com/DafkeDD/itworxs-cli.git
cd itworxs-cli/itworxs-cli      # de package-submap

npm install                     # installeert deps + bouwt dist (prepare-script)
npm run build                   # eenmalig bouwen
npm run dev                     # bouwen in watch-mode
npm run typecheck               # alleen types controleren
node dist/cli.js help           # lokaal draaien
```

## Structuur

```
itworxs-cli/
  src/cli.ts             # entrypoint (argument parsing)
  src/commands/init.ts   # init command logica
  templates/             # bestanden die init kopieert
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
