import path from 'node:path';
import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';
import * as p from '@clack/prompts';
import chalk from 'chalk';

// Map waarin de CLI per project geinstalleerd kan zijn. Draai je 'init' vanuit
// die map, dan komen frontend/ en backend/ in de map erboven (de projectroot).
const INSTALL_DIR_NAME = 'itworxs-cli';

interface Choice {
  value: string;
  label: string;
  hint: string;
}

const FRONTENDS: Choice[] = [
  { value: 'nextjs', label: 'Next.js', hint: 'met TailwindCSS, laatste versie' },
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
      p.note(`map: ${path.join(projectRoot, 'frontend')}\nNext.js + TailwindCSS + Prettier (laatste versies)`, 'Frontend');
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
    (await setupNextjs(projectRoot)) ? done.push('frontend/ (Next.js + Tailwind + Prettier)') : (failed = true);
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

  p.log.step('Prettier toevoegen aan frontend/ ...');
  await fs.writeFile(path.join(dir, '.prettierrc'), PRETTIERRC_FRONTEND);
  await addFormatScript(dir);
  return (await runInShell('npm install -D prettier prettier-plugin-tailwindcss --no-audit --no-fund', dir)) === 0;
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

// --- templates ------------------------------------------------------------

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

// Jouw Prettier-config. Frontend incl. de tailwind-plugin, backend zonder.
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

/** Voeg een 'format'-script toe aan een bestaande package.json (niet kritisch). */
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

// npm-omgeving die de ruis stilzet (audit, funding, warnings) en telemetry uitschakelt.
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
