# itworxs-cli

Basis CLI voor ItWorXs projecten, geschreven in **TypeScript** (gebundeld met `tsup`).
Wordt **per project** geïnstalleerd (niet globaal), met een `init` command dat het
project scaffold.

## Installeren in een project

Om de projectroot schoon te houden, installeer je de CLI in een eigen submap
`itworxs-cli/` binnen je project. Daar belanden dan de `node_modules` en de
`package*.json` — niet in de root van je project.

```bash
# vanuit de root van je project
mkdir itworxs-cli
cd itworxs-cli
npm init -y
npm install --save-dev github:DafkeDD/itworxs-cli
```

Resultaat:

```
mijnproject/
  itworxs-cli/          <-- alle install-rommel zit hier
    node_modules/
    package.json
    package-lock.json
```

## Gebruik

Draai het `init` command **vanuit de `itworxs-cli` map**. Omdat de map zo heet,
scaffold de CLI automatisch de map erboven (je projectroot):

```bash
cd itworxs-cli
npx itworxs init
```

Andere commands:

```bash
npx itworxs help          # toon hulp
npx itworxs version       # toon versie
npx itworxs init --force  # overschrijf bestaande bestanden
npx itworxs init --target <map>   # scaffold een specifieke map
```

### Wat doet `init`?

Het kopieert een basis projectstructuur naar je projectroot:

```
README.md
.gitignore
src/index.js
```

Bestaande bestanden worden overgeslagen, tenzij je `--force` gebruikt. De placeholder
`{{PROJECT_NAME}}` wordt vervangen door de naam van je project (de doelmap).

### Doelmap-logica

- Draai je `init` vanuit een map met de naam `itworxs-cli`, dan scaffold het de
  map erboven (de projectroot).
- Draai je het vanuit een andere map, dan scaffold het die map zelf.
- Met `--target <map>` kies je expliciet een doelmap (relatief of absoluut).

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
