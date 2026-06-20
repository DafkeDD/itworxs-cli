# itworxs-cli

Basis CLI voor ItWorXs projecten, geschreven in **TypeScript** (gebundeld met `tsup`).
Wordt **per project** geïnstalleerd, rechtstreeks van GitHub, in een zichtbare map
`itworxs-cli/`.

## Installeren in een project

Eén commando, vanuit de root van je project. Het haalt de CLI **rechtstreeks van
GitHub** en zet hem in de map `itworxs-cli/`:

```bash
npm install --prefix itworxs-cli github:DafkeDD/itworxs-cli
```

Resultaat — de install is zichtbaar in `itworxs-cli/`, je projectroot blijft schoon:

```
mijn-project/
  itworxs-cli/
    node_modules/
    package.json
    package-lock.json
```

## Gebruik

```bash
cd itworxs-cli
npx itworxs init       # zet een frontend op (vraagt welke je wil)
npx itworxs help       # toon hulp
npx itworxs version    # toon versie
```

### `init`

`init` vraagt welke frontend je wil gebruiken:

```
Welke frontend wil je gebruiken?

  1) Next.js + TailwindCSS (laatste versie)

Keuze [1]:
```

Bij keuze 1 draait de CLI `create-next-app@latest` (dus altijd de nieuwste
Next.js + TailwindCSS) en zet die in een map **`frontend/`** in je projectroot
(naast `itworxs-cli/`):

```
mijn-project/
  itworxs-cli/     # de CLI-install (zichtbaar, van GitHub)
  frontend/        # de Next.js + Tailwind app
```

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
npm run typecheck      # alleen types controleren
node dist/cli.js help  # lokaal draaien
```

## Structuur

```
src/cli.ts             # entrypoint (argument parsing)
src/commands/init.ts   # init command (frontend-prompt + install)
install.ps1            # helper-commando voor de install
dist/                  # build-output (gegenereerd, niet in git)
tsup.config.ts         # bundler-config
tsconfig.json          # TypeScript-config
package.json           # bin-veld maakt 'itworxs' command aan
```

## Licentie

MIT
