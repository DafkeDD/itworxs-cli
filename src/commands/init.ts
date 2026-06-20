import path from 'node:path';
import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';
import * as p from '@clack/prompts';
import chalk from 'chalk';

const INSTALL_DIR_NAME = 'itworxs-cli';

interface Choice {
  value: string;
  label: string;
  hint: string;
}

const FRONTENDS: Choice[] = [
  { value: 'nextjs', label: 'Next.js', hint: 'TypeScript, TailwindCSS, next-intl, Prettier' },
  { value: 'none', label: 'Geen', hint: 'geen frontend' },
];

const BACKENDS: Choice[] = [
  { value: 'node-express', label: 'Node.js + Express', hint: 'TypeScript, basis API-server' },
  { value: 'none', label: 'Geen', hint: 'geen backend' },
];

export interface InitOptions {
  dryRun?: boolean;
  frontend?: string;
  backend?: string;
}

function resolveProjectRoot(): string {
  const cwd = process.cwd();
  if (path.basename(cwd) === INSTALL_DIR_NAME) return path.dirname(cwd);
  return cwd;
}

export async function runInit({ dryRun = false, frontend, backend }: InitOptions = {}): Promise<void> {
  const projectRoot = resolveProjectRoot();

  p.intro(chalk.bgCyan(chalk.black(' itworxs ')) + ' project setup');

  const frontendChoice = await pick('Welke frontend wil je gebruiken?', FRONTENDS, frontend);
  if (frontendChoice === undefined) return;

  const backendChoice = await pick('Welke backend wil je gebruiken?', BACKENDS, backend);
  if (backendChoice === undefined) return;

  if (frontendChoice === 'none' && backendChoice === 'none') {
    p.outro(chalk.dim('Niets geselecteerd - niets te doen.'));
    return;
  }

  if (dryRun) {
    if (frontendChoice === 'nextjs') {
      p.note(`map: ${path.join(projectRoot, 'frontend')}\nNext.js + TailwindCSS + next-intl (i18n) + Prettier`, 'Frontend');
    }
    if (backendChoice === 'node-express') {
      p.note(`map: ${path.join(projectRoot, 'backend')}\nNode.js + Express in TypeScript + Prettier`, 'Backend');
    }
    p.outro(chalk.yellow('dry-run: niets uitgevoerd'));
    return;
  }

  const done: string[] = [];
  let failed = false;

  if (frontendChoice === 'nextjs') {
    (await setupNextjs(projectRoot)) ? done.push('frontend/ (Next.js + Tailwind + next-intl + Prettier)') : (failed = true);
  }
  if (!failed && backendChoice === 'node-express') {
    (await setupNodeExpress(projectRoot)) ? done.push('backend/ (Express + TypeScript + Prettier)') : (failed = true);
  }

  if (failed) {
    p.outro(chalk.red('Setup gestopt door een fout.'));
    process.exitCode = 1;
    return;
  }

  p.outro(chalk.green('Klaar! ') + (done.length ? `Aangemaakt: ${done.join(', ')}.` : ''));
}

async function pick(message: string, options: Choice[], preset?: string): Promise<string | undefined> {
  if (preset) return preset;
  const answer = await p.select({ message, options: options.map((o) => ({ value: o.value, label: o.label, hint: o.hint })) });
  if (p.isCancel(answer)) {
    p.cancel('Geannuleerd.');
    return undefined;
  }
  return answer as string;
}

// --- Next.js -------------------------------------------------------------

async function setupNextjs(projectRoot: string): Promise<boolean> {
  const dir = path.join(projectRoot, 'frontend');
  if (await dirHasContent(dir)) {
    p.log.error(`Map 'frontend' bestaat al en is niet leeg: ${dir}`);
    return false;
  }
  p.log.step('Next.js + TailwindCSS installeren in frontend/ ...');
  const command =
    'npx create-next-app@latest frontend ' +
    '--ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes';
  if ((await runInShell(command, projectRoot)) !== 0) return false;

  if (!(await setupNextIntl(dir))) return false;

  p.log.step('Prettier toevoegen aan frontend/ ...');
  await fs.writeFile(path.join(dir, '.prettierrc'), PRETTIERRC_FRONTEND);
  await addFormatScript(dir);
  return (await runInShell('npm install -D prettier prettier-plugin-tailwindcss --no-audit --no-fund', dir)) === 0;
}

/** next-intl (i18n) opzetten volgens de App Router setup. */
async function setupNextIntl(dir: string): Promise<boolean> {
  p.log.step('next-intl (i18n) toevoegen aan frontend/ ...');
  const src = path.join(dir, 'src');

  await fs.writeFile(path.join(dir, 'next.config.ts'), NEXT_CONFIG_TS);

  await fs.mkdir(path.join(src, 'i18n'), { recursive: true });
  await fs.writeFile(path.join(src, 'i18n', 'routing.ts'), ROUTING_TS);
  await fs.writeFile(path.join(src, 'i18n', 'navigation.ts'), NAVIGATION_TS);
  await fs.writeFile(path.join(src, 'i18n', 'request.ts'), REQUEST_TS);
  await fs.writeFile(path.join(src, 'proxy.ts'), PROXY_TS);

  await fs.mkdir(path.join(dir, 'messages'), { recursive: true });
  await fs.writeFile(path.join(dir, 'messages', 'en.json'), MESSAGES_EN);
  await fs.writeFile(path.join(dir, 'messages', 'nl.json'), MESSAGES_NL);
  await fs.writeFile(path.join(dir, 'messages', 'fr.json'), MESSAGES_FR);

  const localeDir = path.join(src, 'app', '[locale]');
  await fs.mkdir(localeDir, { recursive: true });
  await fs.writeFile(path.join(localeDir, 'layout.tsx'), LOCALE_LAYOUT_TSX);
  await fs.writeFile(path.join(localeDir, 'page.tsx'), LOCALE_PAGE_TSX);

  await fs.mkdir(path.join(src, 'components'), { recursive: true });
  await fs.writeFile(path.join(src, 'components', 'LocaleSwitcher.tsx'), LOCALE_SWITCHER_TSX);

  // standaard root-app bestanden weghalen (vervangen door [locale]/)
  await fs.rm(path.join(src, 'app', 'page.tsx'), { force: true });
  await fs.rm(path.join(src, 'app', 'layout.tsx'), { force: true });

  return (await runInShell('npm install next-intl --no-audit --no-fund', dir)) === 0;
}

// --- Node.js + Express (TypeScript) --------------------------------------

async function setupNodeExpress(projectRoot: string): Promise<boolean> {
  const dir = path.join(projectRoot, 'backend');
  if (await dirHasContent(dir)) {
    p.log.error(`Map 'backend' bestaat al en is niet leeg: ${dir}`);
    return false;
  }
  p.log.step('Node.js + Express (TypeScript) opzetten in backend/ ...');

  await fs.mkdir(path.join(dir, 'src'), { recursive: true });

  const pkg = {
    name: 'backend',
    version: '1.0.0',
    type: 'module',
    main: 'dist/index.js',
    scripts: {
      dev: 'tsx watch src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
      format: 'prettier --write .',
    },
  };
  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2) + '\n');
  await fs.writeFile(path.join(dir, 'tsconfig.json'), TSCONFIG_BACKEND);
  await fs.writeFile(path.join(dir, 'src', 'index.ts'), EXPRESS_SERVER_TS);
  await fs.writeFile(path.join(dir, '.prettierrc'), PRETTIERRC_BACKEND);
  await fs.writeFile(path.join(dir, '.gitignore'), 'node_modules/\ndist/\n.env\n');

  if ((await runInShell('npm install express --no-audit --no-fund', dir)) !== 0) return false;
  return (
    (await runInShell(
      'npm install -D typescript tsx @types/express @types/node prettier --no-audit --no-fund',
      dir,
    )) === 0
  );
}

// --- templates: backend ---------------------------------------------------

const EXPRESS_SERVER_TS = `import express from 'express'
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

const TSCONFIG_BACKEND = `{
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

// --- templates: next-intl -------------------------------------------------

const NEXT_CONFIG_TS = `import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')
export default withNextIntl(nextConfig)
`;

const ROUTING_TS = `import { defineRouting } from 'next-intl/routing'

// Pas hier de ondersteunde talen aan.
export const routing = defineRouting({
    locales: ['en', 'nl', 'fr'],
    defaultLocale: 'en'
})
`;

const NAVIGATION_TS = `import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
    createNavigation(routing)
`;

const REQUEST_TS = `import { getRequestConfig } from 'next-intl/server'
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

const PROXY_TS = `import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
    matcher: '/((?!api|trpc|_next|_vercel|.*\\\\..*).*)'
}
`;

const MESSAGES_EN = `{
    "home": {
        "title": "Welcome to ItWorXs!",
        "welcomeMessage": "A multilingual Next.js app, ready to go."
    }
}
`;

const MESSAGES_NL = `{
    "home": {
        "title": "Welkom bij ItWorXs!",
        "welcomeMessage": "Een meertalige Next.js-app, klaar voor gebruik."
    }
}
`;

const MESSAGES_FR = `{
    "home": {
        "title": "Bienvenue chez ItWorXs!",
        "welcomeMessage": "Une application Next.js multilingue, prete a l'emploi."
    }
}
`;

const LOCALE_LAYOUT_TSX = `import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
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
        <html lang={locale}>
            <body>
                <NextIntlClientProvider>
                    <LocaleSwitcher />
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
`;

const LOCALE_PAGE_TSX = `import { useTranslations } from 'next-intl'
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

const LOCALE_SWITCHER_TSX = `'use client'

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

// --- templates: prettier --------------------------------------------------

const PRETTIERRC_FRONTEND = `{
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

const PRETTIERRC_BACKEND = `{
    "arrowParens": "avoid",
    "singleQuote": true,
    "tabWidth": 4,
    "trailingComma": "none",
    "semi": false,
    "proseWrap": "always",
    "printWidth": 80
}
`;

// --- helpers --------------------------------------------------------------

async function addFormatScript(dir: string): Promise<void> {
  const pkgPath = path.join(dir, 'package.json');
  try {
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf8')) as { scripts?: Record<string, string> };
    pkg.scripts = { ...(pkg.scripts ?? {}), format: 'prettier --write .' };
    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  } catch {
    // package.json niet leesbaar - format-script overslaan
  }
}

function quietEnv(): NodeJS.ProcessEnv {
  return {
    ...process.env,
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    npm_config_loglevel: 'error',
    NEXT_TELEMETRY_DISABLED: '1',
    ADBLOCK: '1',
    DISABLE_OPENCOLLECTIVE: '1',
  };
}

function runInShell(command: string, cwd: string): Promise<number | null> {
  return new Promise((resolve) => {
    const child = spawn(command, { cwd, stdio: 'inherit', shell: true, env: quietEnv() });
    child.on('close', (code) => resolve(code));
    child.on('error', (err) => {
      console.error(err);
      resolve(1);
    });
  });
}

async function dirHasContent(dir: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(dir);
    return entries.length > 0;
  } catch {
    return false;
  }
}
