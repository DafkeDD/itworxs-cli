# itworxs-cli

Basis CLI voor ItWorXs projecten, geschreven in **TypeScript** (gebundeld met `tsup`).
Wordt **per project** geïnstalleerd in een eigen map `itworxs-cli/`, zodat je
duidelijk ziet dat de CLI in je project geïnstalleerd is en je projectroot schoon blijft.

## Installeren in een project

Draai dit in de root van je project (PowerShell). Het maakt de map `itworxs-cli/`
en installeert de CLI daarin:

```powershell
New-Item -ItemType Directory -Force itworxs-cli > $null
Push-Location itworxs-cli
npm init -y > $null
npm install --save-dev github:DafkeDD/itworxs-cli
Pop-Location
```

Resultaat — de install is zichtbaar in `itworxs-cli/`:

```
mijn-project/
  itworxs-cli/
    node_modules/
    package.json
    package-lock.json
```

> In de repo zit ook `install.ps1` met exact deze stappen.

## Gebruik

Draai de commands **vanuit de `itworxs-cli` map**:

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
  itworxs-cli/     # de CLI-install (zichtbaar)
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
npm run dev            # bouwen in watch-mode
npm run typecheck      # alleen types controleren
node dist/cli.js help  # lokaal draaien
```

## Structuur

```
src/cli.ts             # entrypoint (argument parsing)
src/commands/init.ts   # init command (frontend-prompt + install)
install.ps1            # helper om de CLI in itworxs-cli/ te installeren
dist/                  # build-output (gegenereerd, niet in git)
tsup.config.ts         # bundler-config
tsconfig.json          # TypeScript-config
package.json           # bin-veld maakt 'itworxs' command aan
```

## Licentie

MIT
