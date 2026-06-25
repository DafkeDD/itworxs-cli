#!/usr/bin/env node

// src/commands/init.ts
import path from "path";
import { promises as fs } from "fs";
import { existsSync } from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import * as p from "@clack/prompts";
import chalk from "chalk";
var INSTALL_DIR_NAME = "itworxs-cli";
var moduleDir = path.dirname(fileURLToPath(import.meta.url));
var CLAUDE_TEMPLATES_DIR = path.resolve(moduleDir, "../templates/claude");
var FRONTENDS = [
  { value: "nextjs", label: "Next.js", hint: "TypeScript, TailwindCSS, next-intl, Prettier" },
  { value: "none", label: "Geen", hint: "geen frontend" }
];
var BACKENDS = [
  { value: "node-express", label: "Node.js + Express", hint: "TypeScript, basis API-server" },
  { value: "none", label: "Geen", hint: "geen backend" }
];
var DATABASES = [
  { value: "postgresql", label: "PostgreSQL", hint: "aanbevolen (pg + config/db.ts)" },
  { value: "none", label: "Geen", hint: "geen database" }
];
var REPO_HOSTS = [
  { value: "github", label: "GitHub", hint: "GitHub Actions CI" },
  { value: "none", label: "Geen", hint: "geen repo-config" }
];
var UIUX_CHOICES = [
  { value: "no", label: "Nee", hint: "geen design-skill" },
  { value: "yes", label: "Ja", hint: "ui-ux-pro-max (extern, vereist Python 3)" }
];
var PGSKILLS_CHOICES = [
  { value: "no", label: "Nee", hint: "geen Postgres-skill" },
  { value: "yes", label: "Ja", hint: "neondatabase/postgres-skills (best practices)" }
];
function resolveProjectRoot() {
  const cwd = process.cwd();
  if (path.basename(cwd) === INSTALL_DIR_NAME) return path.dirname(cwd);
  return cwd;
}
async function runInit({ dryRun = false, frontend, backend, database, repo, design, pgSkills } = {}) {
  const projectRoot = resolveProjectRoot();
  p.intro(chalk.bgCyan(chalk.black(" itworxs ")) + " project setup");
  const frontendChoice = await pick("Welke frontend wil je gebruiken?", FRONTENDS, frontend);
  if (frontendChoice === void 0) return;
  const backendChoice = await pick("Welke backend wil je gebruiken?", BACKENDS, backend);
  if (backendChoice === void 0) return;
  let databaseChoice = "none";
  if (backendChoice === "node-express") {
    const db = await pick("Welke database wil je gebruiken?", DATABASES, database);
    if (db === void 0) return;
    databaseChoice = db;
  }
  if (frontendChoice === "none" && backendChoice === "none") {
    p.outro(chalk.dim("Niets geselecteerd - niets te doen."));
    return;
  }
  const repoChoice = await pick("Waar wil je de repository hosten?", REPO_HOSTS, repo);
  if (repoChoice === void 0) return;
  let uiuxChoice = "no";
  if (frontendChoice === "nextjs") {
    const choice = await pick("UI/UX design-skill (ui-ux-pro-max) toevoegen?", UIUX_CHOICES, design);
    if (choice === void 0) return;
    uiuxChoice = choice;
  }
  let pgSkillsChoice = "no";
  if (databaseChoice === "postgresql") {
    const choice = await pick("Postgres best-practices skill toevoegen?", PGSKILLS_CHOICES, pgSkills);
    if (choice === void 0) return;
    pgSkillsChoice = choice;
  }
  if (dryRun) {
    if (frontendChoice === "nextjs") {
      p.note(`map: ${path.join(projectRoot, "frontend")}
Next.js + TailwindCSS + next-intl (i18n) + Prettier`, "Frontend");
    }
    if (backendChoice === "node-express") {
      const dbLine = databaseChoice === "postgresql" ? "PostgreSQL" : "geen";
      p.note(`map: ${path.join(projectRoot, "backend")}
Express (TypeScript)
Database: ${dbLine}`, "Backend");
    }
    if (repoChoice === "github") {
      p.note("GitHub Actions CI -> .github/workflows/ci.yml", "Repository");
    }
    p.note(".claude/ met MCP-config, quality-skill en reviewer-agent", "Claude-tooling");
    if (uiuxChoice === "yes") {
      p.note("ui-ux-pro-max design-skill via uipro-cli (vereist Python 3)", "UI/UX");
    }
    if (pgSkillsChoice === "yes") {
      p.note("postgres-best-practices skill via skills-cli", "PostgreSQL skill");
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
    await setupNodeExpress(projectRoot, databaseChoice) ? done.push("backend/ (Express + TypeScript + Prettier)") : failed = true;
  }
  if (!failed && repoChoice === "github") {
    await setupGitHub(projectRoot, frontendChoice === "nextjs", backendChoice === "node-express");
    done.push(".github/workflows/ci.yml");
  }
  if (!failed) {
    await setupClaude(projectRoot, databaseChoice === "postgresql", repoChoice === "github");
    done.push(".claude/ (MCP + quality-skill + reviewer-agent)");
  }
  if (!failed && uiuxChoice === "yes") {
    await setupUiUx(projectRoot);
    done.push("ui-ux-pro-max design-skill");
  }
  if (!failed && pgSkillsChoice === "yes") {
    await setupPostgresSkills(projectRoot);
    done.push("postgres-best-practices skill");
  }
  if (failed) {
    p.outro(chalk.red("Setup gestopt door een fout."));
    process.exitCode = 1;
    return;
  }
  p.outro(chalk.green("Klaar! ") + (done.length ? `Aangemaakt: ${done.join(", ")}.` : ""));
}
async function runUpdate() {
  const projectRoot = resolveProjectRoot();
  p.intro(chalk.bgCyan(chalk.black(" itworxs ")) + " tooling update");
  const withPostgres = existsSync(path.join(projectRoot, "backend", "src", "config", "db.ts"));
  const withGithub = existsSync(path.join(projectRoot, ".github", "workflows", "ci.yml"));
  await setupClaude(projectRoot, withPostgres, withGithub);
  const extras = [withPostgres ? "postgres-MCP" : "", withGithub ? "github-MCP" : ""].filter(Boolean);
  p.outro(
    chalk.green("Klaar! ") + `.claude/ bijgewerkt${extras.length ? " (incl. " + extras.join(" + ") + ")" : ""}. Je HANDOFF.md blijft behouden.`
  );
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
  p.log.step("react-icons toevoegen aan frontend/ ...");
  if (await runInShell("npm install react-icons --no-audit --no-fund", dir) !== 0) return false;
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
async function setupNodeExpress(projectRoot, database) {
  const dir = path.join(projectRoot, "backend");
  if (await dirHasContent(dir)) {
    p.log.error(`Map 'backend' bestaat al en is niet leeg: ${dir}`);
    return false;
  }
  const usePg = database === "postgresql";
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
  await fs.writeFile(path.join(dir, "src", "index.ts"), buildIndexTs(usePg));
  await fs.writeFile(path.join(dir, "src", "config", "env.ts"), buildEnvTs(usePg));
  await fs.writeFile(path.join(dir, "src", "config", "locale.ts"), LOCALE_TS);
  await fs.writeFile(path.join(dir, "src", "services", "logger.ts"), LOGGER_TS);
  if (usePg) {
    await fs.writeFile(path.join(dir, "src", "config", "db.ts"), DB_TS);
  }
  await fs.writeFile(path.join(dir, ".env.example"), ENV_EXAMPLE);
  await fs.writeFile(path.join(dir, ".gitignore"), "node_modules/\ndist/\n.env\n");
  const runtime = ["express", "cors", "dotenv", "node-cron", "pino"];
  if (usePg) runtime.push("pg");
  const dev = [
    "typescript",
    "tsx",
    "nodemon",
    "prettier",
    "@types/express",
    "@types/node",
    "@types/cors",
    "@types/node-cron"
  ];
  if (usePg) dev.push("@types/pg");
  if (await runInShell("npm install " + runtime.join(" ") + " --no-audit --no-fund", dir) !== 0) {
    return false;
  }
  return await runInShell("npm install -D " + dev.join(" ") + " --no-audit --no-fund", dir) === 0;
}
function buildEnvTs(usePg) {
  const dbFields = usePg ? `,
    DB_HOST: required('DB_HOST', 'localhost'),
    DB_USER: required('DB_USER', 'postgres'),
    DB_PASSWORD: required('DB_PASSWORD', 'password'),
    DB_DATABASE: required('DB_DATABASE', 'projectx'),
    DB_PORT: Number(get('DB_PORT') ?? 5432)` : "";
  return `import 'dotenv/config'

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
    FRONTEND_URL: get('FRONTEND_URL') ?? 'http://localhost:3000'${dbFields}
}
`;
}
function buildIndexTs(usePg) {
  const poolImport = usePg ? `
import pool from './config/db.js'` : "";
  const health = usePg ? `app.get('/health', async (_req: Request, res: Response) => {
    try {
        await pool.query('SELECT 1')
        res.json({ status: 'ok', db: 'up' })
    } catch (err) {
        logger.error({ err }, 'Database health check mislukt')
        res.status(500).json({ status: 'error', db: 'down' })
    }
})` : `app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' })
})`;
  return `import express from 'express'
import type { Request, Response } from 'express'
import cors from 'cors'${poolImport}
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

// Health check
${health}

app.listen(env.PORT, () => {
    logger.info('Backend draait op http://localhost:' + env.PORT)
})
`;
}
async function setupGitHub(projectRoot, hasFrontend, hasBackend) {
  p.log.step("GitHub Actions CI toevoegen (.github/workflows/ci.yml) ...");
  const dir = path.join(projectRoot, ".github", "workflows");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "ci.yml"), buildCiYaml(hasFrontend, hasBackend));
}
async function setupClaude(projectRoot, withPostgres, withGithub) {
  p.log.step("Claude-tooling toevoegen (.claude/) ...");
  const claudeDir = path.join(projectRoot, ".claude");
  await fs.cp(CLAUDE_TEMPLATES_DIR, claudeDir, { recursive: true });
  await fs.writeFile(path.join(claudeDir, "mcp.json"), buildMcpJson(withPostgres, withGithub));
}
function buildMcpJson(withPostgres, withGithub) {
  const mcpServers = {
    context7: {
      command: "npx",
      args: ["-y", "@upstash/context7-mcp@latest"],
      env: {},
      description: "Context7 - actuele library-documentatie voor frameworks en SDKs"
    },
    playwright: {
      command: "npx",
      args: ["-y", "@playwright/mcp@latest"],
      env: {},
      description: "Playwright - browser-automation voor het testen en debuggen van web-UIs"
    },
    gitnexus: {
      command: "npx",
      args: ["-y", "gitnexus-mcp@latest"],
      env: {},
      description: "GitNexus - codebase-kennisgraaf voor architectuur en impact-analyse"
    }
  };
  if (withGithub) {
    mcpServers.github = {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_PERSONAL_ACCESS_TOKEN}" },
      description: "GitHub - issues, PRs en Actions beheren (zet GITHUB_PERSONAL_ACCESS_TOKEN in je omgeving)"
    };
  }
  if (withPostgres) {
    mcpServers.postgres = {
      command: "npx",
      args: [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:password@localhost:5432/projectx"
      ],
      env: {},
      description: "PostgreSQL - read-only SQL-toegang tot de projectdatabase (pas de connection string aan)"
    };
  }
  return JSON.stringify({ mcpServers }, null, 2) + "\n";
}
async function setupUiUx(projectRoot) {
  p.log.step("UI/UX design-skill (ui-ux-pro-max) installeren via uipro-cli ...");
  const code = await runInShell("npx -y uipro-cli init --ai claude", projectRoot);
  if (code === 0) {
    p.log.info("Let op: de ui-ux-pro-max skill vereist Python 3 om te draaien.");
  } else {
    p.log.warn("ui-ux-pro-max installeren is mislukt; je kunt het later draaien met: npx uipro-cli init --ai claude");
  }
}
async function setupPostgresSkills(projectRoot) {
  p.log.step("Postgres best-practices skill installeren via skills-cli ...");
  const code = await runInShell("npx -y skills add neondatabase/postgres-skills", projectRoot);
  if (code !== 0) {
    p.log.warn("postgres-skills installeren is mislukt; later: npx skills add neondatabase/postgres-skills");
  }
}
function buildCiYaml(hasFrontend, hasBackend) {
  const job = (name, dir) => `  ${name}:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ${dir}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm run build
`;
  const jobs = [];
  if (hasFrontend) jobs.push(job("frontend", "frontend"));
  if (hasBackend) jobs.push(job("backend", "backend"));
  const jobsBlock = jobs.length > 0 ? jobs.join("") : `  noop:
    runs-on: ubuntu-latest
    steps:
      - run: echo "Niets te bouwen"
`;
  return `name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
${jobsBlock}`;
}
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
var LOGGER_TS = `import pino from 'pino'
import { env } from '../config/env.js'

export const logger = pino({
    level: env.LOG_LEVEL
})
`;
var LOCALE_TS = `// Single source of truth voor app-talen. Frontend i18n (next-intl) en backend mail-templating
// moeten dezelfde lijst respecteren - wijziging hier vereist sync met frontend/messages/.
export const SUPPORTED_LOCALES = ['en', 'nl', 'fr', 'de'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export const parseLocale = (input: unknown): Locale => {
    if (typeof input !== 'string') return DEFAULT_LOCALE
    return (SUPPORTED_LOCALES as readonly string[]).includes(input)
        ? (input as Locale)
        : DEFAULT_LOCALE
}
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
    defaultLocale: 'en',
    // Geen taalcode in de URL (/nl, /de, ...). Taal wordt via een cookie bijgehouden.
    localePrefix: 'never'
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
import { FaReact } from 'react-icons/fa'
import { ThemeProvider } from '@/components/ThemeProvider'
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
            <body className="flex min-h-screen flex-col">
                <ThemeProvider>
                    <NextIntlClientProvider>
                        <header className="flex items-center justify-between p-4">
                            <span className="flex items-center gap-2 font-semibold">
                                <FaReact className="text-cyan-500" /> ItWorXs
                            </span>
                            <div className="flex items-center gap-2">
                                <LocaleSwitcher />
                                <ThemeSwitcher />
                            </div>
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
        <main className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
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

/* Volg de OS-voorkeur voor JS (geen flits voor 'system'); expliciete keuze wint. */
@media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
        --bg: #0a0c10;
        --surface: #14171d;
        --text: #e6e9ef;
        --text-2: #9aa3b2;
        --border: #262b34;
        --accent: #2dd4bf;
    }
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
var VERSION = "0.21.0";
var HELP = `
itworxs - basis CLI voor ItWorXs projecten

Gebruik:
  itworxs <command> [opties]

Commands:
  init       Project setup (vraagt frontend en backend)
  update     Werk de .claude-tooling bij in een bestaand project
  help       Toon deze hulp
  version    Toon de versie

Opties bij init:
  --frontend <naam>   Sla de frontend-vraag over (bv. nextjs, none)
  --backend <naam>    Sla de backend-vraag over (bv. node-express, none)
  --database <naam>   Sla de database-vraag over (bv. postgresql, none)
  --repo <naam>       Repo-host (bv. github, none)
  --design <ja|nee>   UI/UX design-skill (yes, no)
  --pg-skills <ja|nee> Postgres best-practices skill (yes, no)
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
      const database = getFlagValue(flags, "--database");
      const repo = getFlagValue(flags, "--repo");
      const design = getFlagValue(flags, "--design");
      const pgSkills = getFlagValue(flags, "--pg-skills");
      await runInit({ dryRun, frontend, backend, database, repo, design, pgSkills });
      break;
    }
    case "update":
      await runUpdate();
      break;
    default:
      console.error(`Onbekend command: ${command}
`);
      console.log(HELP);
      process.exitCode = 1;
  }
}
main();
