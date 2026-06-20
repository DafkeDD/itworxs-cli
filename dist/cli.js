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
  await fs.writeFile(path.join(src, "app", "globals.css"), GLOBALS_CSS);
  return true;
}
async function setupNodeExpress(projectRoot) {
  const dir = path.join(projectRoot, "backend");
  if (await dirHasContent(dir)) {
    p.log.error(`Map 'backend' bestaat al en is niet leeg: ${dir}`);
    return false;
  }
  p.log.step("Node.js + Express (TypeScript) opzetten in backend/ ...");
  await fs.mkdir(path.join(dir, "src"), { recursive: true });
  const subDirs = ["config", "controllers", "data", "middleware", "modals", "routes", "services"];
  for (const sub of subDirs) {
    await fs.mkdir(path.join(dir, "src", sub), { recursive: true });
    await fs.writeFile(path.join(dir, "src", sub, ".gitkeep"), "");
  }
  const pkg = {
    name: "backend",
    version: "1.0.0",
    type: "module",
    main: "dist/index.js",
    scripts: {
      dev: "nodemon",
      build: "tsc",
      start: "node dist/index.js",
      format: "prettier --write ."
    }
  };
  await fs.writeFile(path.join(dir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");
  await fs.writeFile(
    path.join(dir, "nodemon.json"),
    JSON.stringify({ watch: ["src"], ext: "ts,json", exec: "tsx src/index.ts" }, null, 2) + "\n"
  );
  await fs.writeFile(path.join(dir, "tsconfig.json"), TSCONFIG_BACKEND);
  await fs.writeFile(path.join(dir, "src", "index.ts"), EXPRESS_SERVER_TS);
  await fs.writeFile(path.join(dir, ".prettierrc"), PRETTIERRC_BACKEND);
  await fs.writeFile(path.join(dir, ".gitignore"), "node_modules/\ndist/\n.env\n");
  await fs.writeFile(path.join(dir, "src", "config", "db.ts"), DB_TS);
  await fs.writeFile(path.join(dir, "src", "config", "env.ts"), ENV_TS);
  await fs.writeFile(path.join(dir, "src", "services", "logger.ts"), LOGGER_TS);
  await fs.writeFile(path.join(dir, ".env.example"), ENV_EXAMPLE);
  if (await runInShell("npm install express pg pino dotenv node-cron cors --no-audit --no-fund", dir) !== 0) return false;
  return await runInShell(
    "npm install -D typescript tsx nodemon @types/express @types/node @types/pg @types/node-cron @types/cors prettier --no-audit --no-fund",
    dir
  ) === 0;
}
var EXPRESS_SERVER_TS = `import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'
import cron from 'node-cron'
import pool from './config/db.js'
import { env } from './config/env.js'
import { logger } from './services/logger.js'

const app = express()

app.use(
    cors({
        origin: env.FRONTEND_URL,
        credentials: true
    })
)
app.use(express.json())

app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Hallo vanuit de ItWorXs backend!' })
})

// Health check met database-ping
app.get('/health', async (_req: Request, res: Response) => {
    try {
        await pool.query('SELECT 1')
        res.json({ status: 'ok', db: 'up' })
    } catch (err) {
        logger.error({ err }, 'Database health check mislukt')
        res.status(500).json({ status: 'error', db: 'down' })
    }
})

// Voorbeeld cron-taak (elke minuut). Pas aan of verwijder.
cron.schedule('* * * * *', () => {
    logger.debug('Cron-taak draait')
})

app.listen(env.PORT, () => {
    logger.info('Backend draait op http://localhost:' + env.PORT)
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
var DB_TS = `import pkg from 'pg'
const { Pool } = pkg
import { env } from './env.js'
import { logger } from '../services/logger.js'

const pool = new Pool({
    user: env.DB_USER,
    host: env.DB_HOST,
    database: env.DB_DATABASE,
    password: env.DB_PASSWORD,
    port: env.DB_PORT
})

pool.on('connect', () => {
    logger.info('Connected to the database')
})

pool.on('error', (err: Error) => {
    logger.error({ err }, 'Unexpected error on idle pg client')
})

export default pool
`;
var ENV_TS = `import 'dotenv/config'

// Lege strings (bv. LOG_LEVEL= in .env) gelden als 'niet ingesteld'.
function get(name: string): string | undefined {
    const value = process.env[name]
    return value === undefined || value === '' ? undefined : value
}

function required(name: string, fallback?: string): string {
    const value = get(name) ?? fallback
    if (value === undefined) {
        throw new Error('Ontbrekende environment variabele: ' + name)
    }
    return value
}

export const env = {
    NODE_ENV: get('NODE_ENV') ?? 'development',
    PORT: Number(get('PORT') ?? 5000),
    LOG_LEVEL:
        get('LOG_LEVEL') ?? (get('NODE_ENV') === 'production' ? 'info' : 'debug'),
    DB_HOST: required('DB_HOST', 'localhost'),
    DB_USER: required('DB_USER', 'postgres'),
    DB_PASSWORD: required('DB_PASSWORD', 'password'),
    DB_DATABASE: required('DB_DATABASE', 'projectx'),
    DB_PORT: Number(get('DB_PORT') ?? 5432),
    FRONTEND_URL: get('FRONTEND_URL') ?? 'http://localhost:3000'
}
`;
var LOGGER_TS = `import pino from 'pino'
import { env } from '../config/env.js'

export const logger = pino({
    level: env.LOG_LEVEL
})
`;
var ENV_EXAMPLE = `# NODE_ENV - development | production | test (default: development)
NODE_ENV=development

# Port Settings
PORT=5000

# JWT - minstens 32 willekeurige bytes (genereer met: openssl rand -hex 32)
JWT_SECRET=

# Logger - pino-niveau. Default: 'debug' in dev, 'info' in productie.
# Toegestaan: trace | debug | info | warn | error | fatal | silent
LOG_LEVEL=

# Eenmalige bootstrap: bij elke startup wordt deze user gepromoot tot 'admin'
# als ze nog 'user' is. Verwijder de waarde nadat de admin is aangemaakt.
BOOTSTRAP_ADMIN_EMAIL=

# Database Settings
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=password
DB_DATABASE=projectx
DB_PORT=5432

# SMTP Settings
SMTP_HOST=
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
SMTP_FROM="ProjectX <noreply@projectx.local>"
# Optioneel: TLS servername-override voor SNI mismatch tussen DNS en cert.
SMTP_TLS_SERVERNAME=
# Optioneel: zet op 'false' om self-signed certs te accepteren (alleen dev).
SMTP_TLS_REJECT_UNAUTHORIZED=
# Optioneel: forceer IPv4 (4) of IPv6 (6) bij DNS-resolve van SMTP_HOST.
SMTP_FAMILY=
APP_NAME=ProjectX

# Frontend - STRIKT VEREIST: gebruikt voor OAuth-redirects en CORS-whitelist (geen wildcard).
FRONTEND_URL=http://localhost:3000

# Trust-proxy: zet op 'true' achter reverse-proxy/load-balancer (Cloudflare, nginx, ALB).
# Maakt req.ip de echte client-IP i.p.v. de proxy-IP - essentieel voor rate-limiting.
TRUST_PROXY=false

# OAuth - backend base waarop de provider terugkomt
OAUTH_REDIRECT_BASE=http://localhost:5000

# Google OAuth
OAUTH_GOOGLE_CLIENT_ID=
OAUTH_GOOGLE_CLIENT_SECRET=

# Microsoft (consumer-tenant: persoonlijke MS-accounts)
OAUTH_MICROSOFT_CLIENT_ID=
OAUTH_MICROSOFT_CLIENT_SECRET=

# Azure AD / Entra ID (work / school)
OAUTH_AZURE_CLIENT_ID=
OAUTH_AZURE_CLIENT_SECRET=
OAUTH_AZURE_TENANT=organizations

# GitHub (laat leeg om uit te schakelen)
OAUTH_GITHUB_CLIENT_ID=
OAUTH_GITHUB_CLIENT_SECRET=
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
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import LocaleSwitcher from '@/components/LocaleSwitcher'
import '../globals.css'

const themeScript =
    "(function(){try{var t=localStorage.getItem('itworxs-theme')||'system';var d=t==='system'?(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;document.documentElement.setAttribute('data-theme',d)}catch(e){}})()"

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
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body>
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
var GLOBALS_CSS = `@import "tailwindcss";

@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

:root,
[data-theme="light"] {
    --bg: #ffffff;
    --surface: #f7f8fa;
    --text: #0f1729;
    --text-2: #475063;
    --border: #e7e9ee;
    --accent: #0d9488;
}

[data-theme="dark"] {
    --bg: #0a0c10;
    --surface: #14171d;
    --text: #e6e9ef;
    --text-2: #9aa3b2;
    --border: #262b34;
    --accent: #2dd4bf;
}

body {
    background: var(--bg);
    color: var(--text);
}
`;
var THEME_PROVIDER_TSX = `'use client'

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeCtx {
    theme: Theme
    setTheme: (t: Theme) => void
}

const Ctx = createContext<ThemeCtx | null>(null)
const STORAGE_KEY = 'itworxs-theme'

function resolve(theme: Theme): 'light' | 'dark' {
    if (theme !== 'system') return theme
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
}

function apply(theme: Theme) {
    document.documentElement.setAttribute('data-theme', resolve(theme))
}

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system')

    useEffect(() => {
        const saved = (localStorage.getItem(STORAGE_KEY) as Theme) || 'system'
        setThemeState(saved)
        apply(saved)
    }, [])

    useEffect(() => {
        if (theme !== 'system') return
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        const onChange = () => apply('system')
        mq.addEventListener('change', onChange)
        return () => mq.removeEventListener('change', onChange)
    }, [theme])

    const setTheme = useCallback((t: Theme) => {
        setThemeState(t)
        localStorage.setItem(STORAGE_KEY, t)
        apply(t)
    }, [])

    return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>
}

export function useThemeMode() {
    const ctx = useContext(Ctx)
    if (!ctx) throw new Error('useThemeMode must be used within ThemeProvider')
    return ctx
}
`;
var THEME_SWITCHER_TSX = `'use client'

import { useThemeMode } from './ThemeProvider'

type Theme = 'light' | 'dark' | 'system'

export default function ThemeSwitcher() {
    const { theme, setTheme } = useThemeMode()
    return (
        <select
            value={theme}
            onChange={e => setTheme(e.target.value as Theme)}
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
var VERSION = "0.8.4";
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
