#!/usr/bin/env node

// src/commands/init.ts
import path from "path";
import { promises as fs } from "fs";
import { spawn } from "child_process";
import * as p from "@clack/prompts";
import chalk from "chalk";
var INSTALL_DIR_NAME = "itworxs-cli";
var FRONTENDS = [
  { value: "nextjs", label: "Next.js", hint: "TypeScript, TailwindCSS, next-intl, Prettier" },
  { value: "none", label: "Geen", hint: "geen frontend" }
];
var BACKENDS = [
  { value: "node-express", label: "Node.js + Express", hint: "TypeScript, basis API-server" },
  { value: "none", label: "Geen", hint: "geen backend" }
];
function resolveProjectRoot() {
  const cwd = process.cwd();
  if (path.basename(cwd) === INSTALL_DIR_NAME) return path.dirname(cwd);
  return cwd;
}
async function runInit({ dryRun = false, frontend, backend } = {}) {
  const projectRoot = resolveProjectRoot();
  p.intro(chalk.bgCyan(chalk.black(" itworxs ")) + " project setup");
  const frontendChoice = await pick("Welke frontend wil je gebruiken?", FRONTENDS, frontend);
  if (frontendChoice === void 0) return;
  const backendChoice = await pick("Welke backend wil je gebruiken?", BACKENDS, backend);
  if (backendChoice === void 0) return;
  if (frontendChoice === "none" && backendChoice === "none") {
    p.outro(chalk.dim("Niets geselecteerd - niets te doen."));
    return;
  }
  if (dryRun) {
    if (frontendChoice === "nextjs") {
      p.note(`map: ${path.join(projectRoot, "frontend")}
Next.js + TailwindCSS + next-intl (i18n) + Prettier`, "Frontend");
    }
    if (backendChoice === "node-express") {
      p.note(`map: ${path.join(projectRoot, "backend")}
Node.js + Express in TypeScript + Prettier`, "Backend");
    }
    p.outro(chalk.yellow("dry-run: niets uitgevoerd"));
    return;
  }
  const done = [];
  let failed = false;
  if (frontendChoice === "nextjs") {
    await setupNextjs(projectRoot) ? done.push("frontend/ (Next.js + Tailwind + next-intl + Prettier)") : failed = true;
  }
  if (!failed && backendChoice === "node-express") {
    await setupNodeExpress(projectRoot) ? done.push("backend/ (Express + TypeScript + Prettier)") : failed = true;
  }
  if (failed) {
    p.outro(chalk.red("Setup gestopt door een fout."));
    process.exitCode = 1;
    return;
  }
  p.outro(chalk.green("Klaar! ") + (done.length ? `Aangemaakt: ${done.join(", ")}.` : ""));
}
async function pick(message, options, preset) {
  if (preset) return preset;
  const answer = await p.select({ message, options: options.map((o) => ({ value: o.value, label: o.label, hint: o.hint })) });
  if (p.isCancel(answer)) {
    p.cancel("Geannuleerd.");
    return void 0;
  }
  return answer;
}
async function setupNextjs(projectRoot) {
  const dir = path.join(projectRoot, "frontend");
  if (await dirHasContent(dir)) {
    p.log.error(`Map 'frontend' bestaat al en is niet leeg: ${dir}`);
    return false;
  }
  p.log.step("Next.js + TailwindCSS installeren in frontend/ ...");
  const command = 'npx create-next-app@latest frontend --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes';
  if (await runInShell(command, projectRoot) !== 0) return false;
  if (!await setupNextIntl(dir)) return false;
  if (!await setupTheme(dir)) return false;
  p.log.step("Prettier toevoegen aan frontend/ ...");
  await fs.writeFile(path.join(dir, ".prettierrc"), PRETTIERRC_FRONTEND);
  await addFormatScript(dir);
  return await runInShell("npm install -D prettier prettier-plugin-tailwindcss --no-audit --no-fund", dir) === 0;
}
async function setupNextIntl(dir) {
  p.log.step("next-intl (i18n) toevoegen aan frontend/ ...");
  const src = path.join(dir, "src");
  await fs.writeFile(path.join(dir, "next.config.ts"), NEXT_CONFIG_TS);
  await fs.mkdir(path.join(src, "i18n"), { recursive: true });
  await fs.writeFile(path.join(src, "i18n", "routing.ts"), ROUTING_TS);
  await fs.writeFile(path.join(src, "i18n", "navigation.ts"), NAVIGATION_TS);
  await fs.writeFile(path.join(src, "i18n", "request.ts"), REQUEST_TS);
  await fs.writeFile(path.join(src, "proxy.ts"), PROXY_TS);
  await fs.mkdir(path.join(dir, "messages"), { recursive: true });
  await fs.writeFile(path.join(dir, "messages", "en.json"), MESSAGES_EN);
  await fs.writeFile(path.join(dir, "messages", "nl.json"), MESSAGES_NL);
  await fs.writeFile(path.join(dir, "messages", "fr.json"), MESSAGES_FR);
  await fs.writeFile(path.join(dir, "messages", "de.json"), MESSAGES_DE);
  const localeDir = path.join(src, "app", "[locale]");
  await fs.mkdir(localeDir, { recursive: true });
  await fs.writeFile(path.join(localeDir, "layout.tsx"), LOCALE_LAYOUT_TSX);
  await fs.writeFile(path.join(localeDir, "page.tsx"), LOCALE_PAGE_TSX);
  await fs.mkdir(path.join(src, "components"), { recursive: true });
  await fs.writeFile(path.join(src, "components", "LocaleSwitcher.tsx"), LOCALE_SWITCHER_TSX);
  await fs.rm(path.join(src, "app", "page.tsx"), { force: true });
  await fs.rm(path.join(src, "app", "layout.tsx"), { force: true });
  return await runInShell("npm install next-intl --no-audit --no-fund", dir) === 0;
}
async function setupTheme(dir) {
  p.log.step("Dark/light/system thema toevoegen aan frontend/ ...");
  const src = path.join(dir, "src");
  await fs.mkdir(path.join(src, "components"), { recursive: true });
  await fs.writeFile(path.join(src, "components", "ThemeProvider.tsx"), THEME_PROVIDER_TSX);
  await fs.writeFile(path.join(src, "components", "ThemeSwitcher.tsx"), THEME_SWITCHER_TSX);
  await fs.appendFile(
    path.join(src, "app", "globals.css"),
    "\n/* dark mode via class (next-themes) */\n@custom-variant dark (&:where(.dark, .dark *));\n"
  );
  return await runInShell("npm install next-themes --no-audit --no-fund", dir) === 0;
}
async function setupNodeExpress(projectRoot) {
  const dir = path.join(projectRoot, "backend");
  if (await dirHasContent(dir)) {
    p.log.error(`Map 'backend' bestaat al en is niet leeg: ${dir}`);
    return false;
  }
  p.log.step("Node.js + Express (TypeScript) opzetten in backend/ ...");
  await fs.mkdir(path.join(dir, "src"), { recursive: true });
  const pkg = {
    name: "backend",
    version: "1.0.0",
    type: "module",
    main: "dist/index.js",
    scripts: {
      dev: "tsx watch src/index.ts",
      build: "tsc",
      start: "node dist/index.js",
      format: "prettier --write ."
    }
  };
  await fs.writeFile(path.join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
  await fs.writeFile(path.join(dir, "tsconfig.json"), TSCONFIG_BACKEND);
  await fs.writeFile(path.join(dir, "src", "index.ts"), EXPRESS_SERVER_TS);
  await fs.writeFile(path.join(dir, ".prettierrc"), PRETTIERRC_BACKEND);
  await fs.writeFile(path.join(dir, ".gitignore"), "node_modules/\ndist/\n.env\n");
  if (await runInShell("npm install express --no-audit --no-fund", dir) !== 0) return false;
  return await runInShell(
    "npm install -D typescript tsx @types/express @types/node prettier --no-audit --no-fund",
    dir
  ) === 0;
}
var EXPRESS_SERVER_TS = `import express from 'express'
import type { Request, Response } from 'express'

const app = express()
const port = process.env.PORT ?? 3001

app.use(express.json())

app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Hallo vanuit de ItWorXs backend!' })
})

app.listen(port, () => {
    console.log('Backend draait op http://localhost:' + port)
})
`;
var TSCONFIG_BACKEND = `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src"]
}
`;
var NEXT_CONFIG_TS = `import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
export default withNextIntl(nextConfig)
`;
var ROUTING_TS = `import { defineRouting } from 'next-intl/routing'

// Pas hier de ondersteunde talen aan.
export const routing = defineRouting({
    locales: ['en', 'nl', 'fr', 'de'],
    defaultLocale: 'en'
})
`;
var NAVIGATION_TS = `import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing)
`;
var REQUEST_TS = `import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
    const requested = await requestLocale
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale

    return {
        locale,
        messages: (await import(\`../../messages/\${locale}.json\`)).default
    }
})
`;
var PROXY_TS = `import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
    matcher: '/((?!api|trpc|_next|_vercel|.*\\\\..*).*)'
}
`;
var MESSAGES_EN = `{
    "home": {
        "title": "Welcome to ItWorXs!",
        "welcomeMessage": "A multilingual Next.js app, ready to go."
    }
}
`;
var MESSAGES_NL = `{
    "home": {
        "title": "Welkom bij ItWorXs!",
        "welcomeMessage": "Een meertalige Next.js-app, klaar voor gebruik."
    }
}
`;
var MESSAGES_FR = `{
    "home": {
        "title": "Bienvenue chez ItWorXs!",
        "welcomeMessage": "Une application Next.js multilingue, prete a l'emploi."
    }
}
`;
var MESSAGES_DE = `{
    "home": {
        "title": "Willkommen bei ItWorXs!",
        "welcomeMessage": "Eine mehrsprachige Next.js-App, sofort einsatzbereit."
    }
}
`;
var LOCALE_LAYOUT_TSX = `import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import ThemeProvider from '@/components/ThemeProvider'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import '../globals.css'

export function generateStaticParams() {
    return routing.locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    if (!hasLocale(routing.locales, locale)) {
        notFound()
    }

    return (
        <html lang={locale} suppressHydrationWarning>
            <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
                <ThemeProvider>
                    <NextIntlClientProvider>
                        <header className="flex justify-end gap-2 p-4">
                            <LocaleSwitcher />
                            <ThemeSwitcher />
                        </header>
                        {children}
                    </NextIntlClientProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
`;
var LOCALE_PAGE_TSX = `import { useTranslations } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { use } from 'react'

export default function HomePage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = use(params)
    setRequestLocale(locale)

    const t = useTranslations('home')

    return (
        <main className="p-8">
            <h1 className="text-2xl font-bold">{t('title')}</h1>
            <p>{t('welcomeMessage')}</p>
        </main>
    )
}
`;
var LOCALE_SWITCHER_TSX = `'use client'

import { usePathname, useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { routing } from '@/i18n/routing'

export default function LocaleSwitcher() {
    const locale = useLocale()
    const router = useRouter()
    const pathname = usePathname()

    const switchLocale = (newLocale: string) => {
        if (newLocale !== locale) {
            router.replace(pathname, { locale: newLocale })
            router.refresh()
        }
    }

    return (
        <select
            value={locale}
            onChange={e => switchLocale(e.target.value)}>
            {routing.locales.map(loc => (
                <option key={loc} value={loc}>
                    {loc.toUpperCase()}
                </option>
            ))}
        </select>
    )
}
`;
var THEME_PROVIDER_TSX = `'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ReactNode } from 'react'

export default function ThemeProvider({ children }: { children: ReactNode }) {
    return (
        <NextThemesProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            {children}
        </NextThemesProvider>
    )
}
`;
var THEME_SWITCHER_TSX = `'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeSwitcher() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => setMounted(true), [])
    if (!mounted) return null

    return (
        <select
            value={theme}
            onChange={e => setTheme(e.target.value)}
            aria-label="Thema">
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
        </select>
    )
}
`;
var PRETTIERRC_FRONTEND = `{
    "arrowParens": "avoid",
    "singleQuote": true,
    "jsxSingleQuote": true,
    "tabWidth": 4,
    "trailingComma": "none",
    "semi": false,
    "proseWrap": "always",
    "printWidth": 80,
    "plugins": ["prettier-plugin-tailwindcss"]
}
`;
var PRETTIERRC_BACKEND = `{
    "arrowParens": "avoid",
    "singleQuote": true,
    "tabWidth": 4,
    "trailingComma": "none",
    "semi": false,
    "proseWrap": "always",
    "printWidth": 80
}
`;
async function addFormatScript(dir) {
  const pkgPath = path.join(dir, "package.json");
  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, "utf8"));
    pkg.scripts = { ...pkg.scripts ?? {}, format: "prettier --write ." };
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  } catch {
  }
}
function quietEnv() {
  return {
    ...process.env,
    npm_config_audit: "false",
    npm_config_fund: "false",
    npm_config_loglevel: "error",
    NEXT_TELEMETRY_DISABLED: "1",
    ADBLOCK: "1",
    DISABLE_OPENCOLLECTIVE: "1"
  };
}
function runInShell(command, cwd) {
  return new Promise((resolve) => {
    const child = spawn(command, { cwd, stdio: "inherit", shell: true, env: quietEnv() });
    child.on("close", (code) => resolve(code));
    child.on("error", (err) => {
      console.error(err);
      resolve(1);
    });
  });
}
async function dirHasContent(dir) {
  try {
    const entries = await fs.readdir(dir);
    return entries.length > 0;
  } catch {
    return false;
  }
}

// src/cli.ts
var VERSION = "0.7.0";
var HELP = `
itworxs - basis CLI voor ItWorXs projecten

Gebruik:
  itworxs <command> [opties]

Commands:
  init       Project setup (vraagt frontend en backend)
  help       Toon deze hulp
  version    Toon de versie

Opties bij init:
  --frontend <naam>   Sla de frontend-vraag over (bv. nextjs, none)
  --backend <naam>    Sla de backend-vraag over (bv. node-express, none)
  --dry-run           Toon enkel wat er zou gebeuren, voer niets uit

Algemeen:
  -h, --help          Toon hulp
  -v, --version       Toon de versie
`;
function getFlagValue(flags, name) {
  const idx = flags.indexOf(name);
  if (idx !== -1) return flags[idx + 1];
  const withEq = flags.find((f) => f.startsWith(`${name}=`));
  return withEq ? withEq.split("=").slice(1).join("=") : void 0;
}
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const flags = args.slice(1);
  if (command === "-v" || command === "--version" || command === "version") {
    console.log(VERSION);
    return;
  }
  if (!command || command === "help" || command === "-h" || command === "--help") {
    console.log(HELP);
    return;
  }
  switch (command) {
    case "init": {
      const dryRun = flags.includes("--dry-run");
      const frontend = getFlagValue(flags, "--frontend");
      const backend = getFlagValue(flags, "--backend");
      await runInit({ dryRun, frontend, backend });
      break;
    }
    default:
      console.error(`Onbekend command: ${command}
`);
      console.log(HELP);
      process.exitCode = 1;
  }
}
main();
