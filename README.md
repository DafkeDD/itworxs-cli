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

### Install + wizard in één keer

Wil je meteen na de install de vraag krijgen, koppel dan install en `init` in
één regel (PowerShell), vanuit je projectroot:

```powershell
npm install --prefix itworxs-cli github:DafkeDD/itworxs-cli; cd itworxs-cli; npx itworxs init
```

> In de repo zit ook `install.ps1` dat exact dit doet.

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

`init` start een interactieve setup (zoals een wizard) en vraagt welke frontend
je wil:

```
┌   itworxs  project setup
│
◆  Welke frontend wil je gebruiken?
│  ● Next.js (met TailwindCSS, laatste versie)
└
```

Bij **Next.js** maakt de CLI een map **`frontend/`** in je projectroot en draait
daarin `create-next-app@latest` (dus altijd de nieuwste Next.js + TailwindCSS):

```
mijn-project/
  itworxs-cli/     # de CLI-install (zichtbaar, van GitHub)
  frontend/        # de Next.js + Tailwind app
```

Opties:

- `--frontend <naam>` — sla de vraag over, bv. `npx itworxs init --frontend nextjs`.
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
