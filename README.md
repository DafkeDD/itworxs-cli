# itworxs-cli

Basis CLI voor ItWorXs projecten. Wordt **per project** geïnstalleerd (niet globaal), met een `init` command dat de huidige map scaffold.

## Installeren in een project

In de map van het project waar je de CLI wil gebruiken:

```bash
# Vanuit GitHub
npm install --save-dev github:DafkeDD/itworxs-cli

# Of een specifieke branch / tag
npm install --save-dev github:DafkeDD/itworxs-cli#main
```

Dit voegt de CLI toe als dev-dependency in dat project. Hierna is het command beschikbaar via `npx`:

```bash
npx itworxs init
```

> Geen globale installatie nodig. Elke project-map heeft zijn eigen versie in `node_modules`.

## Gebruik

```bash
npx itworxs help        # toon hulp
npx itworxs version     # toon versie
npx itworxs init        # scaffold huidige map
npx itworxs init --force  # overschrijf bestaande bestanden
```

### Wat doet `init`?

Het kopieert een basis projectstructuur naar de map waar je het draait:

```
README.md
.gitignore
src/index.js
```

Bestanden die al bestaan worden overgeslagen, tenzij je `--force` gebruikt. De placeholder `{{PROJECT_NAME}}` wordt vervangen door de naam van de huidige map.

## Lokaal ontwikkelen aan de CLI zelf

```bash
git clone https://github.com/DafkeDD/itworxs-cli.git
cd itworxs-cli
node bin/cli.js help

# Of testen in een andere map via npm link
npm link
```

## Structuur

```
bin/cli.js              # entrypoint (argument parsing)
src/commands/init.js    # init command logica
templates/              # bestanden die init kopieert
package.json            # bin-veld maakt 'itworxs' command aan
```

## Een nieuw command toevoegen

1. Maak 