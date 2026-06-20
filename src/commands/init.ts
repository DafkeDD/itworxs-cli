import path from 'node:path';
import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';
import * as p from '@clack/prompts';
import chalk from 'chalk';

// Map waarin de CLI per project geinstalleerd wordt. Draai je 'init' vanuit
// die map, dan komt frontend/ in de map erboven (de projectroot).
const INSTALL_DIR_NAME = 'itworxs-cli';

interface FrontendChoice {
  value: string;
  label: string;
  hint: string;
}

const FRONTENDS: FrontendChoice[] = [
  { value: 'nextjs', label: 'Next.js', hint: 'met TailwindCSS, laatste versie' },
];

export interface InitOptions {
  /** Toon enkel het commando dat gedraaid zou worden, voer niets uit. */
  dryRun?: boolean;
  /** Sla de vraag over en kies direct deze frontend (non-interactief). */
  frontend?: string;
}

/** Bepaal de projectroot (parent als we in de itworxs-cli map zitten). */
function resolveProjectRoot(): string {
  const cwd = process.cwd();
  if (path.basename(cwd) === INSTALL_DIR_NAME) return path.dirname(cwd);
  return cwd;
}

export async function runInit({ dryRun = false, frontend }: InitOptions = {}): Promise<void> {
  const projectRoot = resolveProjectRoot();

  p.intro(chalk.bgCyan(chalk.black(' itworxs ')) + ' project setup');

  // Stap 1: welke frontend?
  let choice: string | symbol;
  if (frontend) {
    choice = frontend;
  } else {
    choice = await p.select({
      message: 'Welke frontend wil je gebruiken?',
      options: FRONTENDS.map((f) => ({ value: f.value, label: f.label, hint: f.hint })),
    });
  }

  if (p.isCancel(choice)) {
    p.cancel('Geannuleerd.');
    return;
  }

  const selected = FRONTENDS.find((f) => f.value === choice);
  if (!selected) {
    p.cancel(`Onbekende frontend: ${String(choice)}`);
    process.exitCode = 1;
    return;
  }

  if (selected.value === 'nextjs') {
    await setupNextjs(projectRoot, dryRun);
  }
}

async function setupNextjs(projectRoot: string, dryRun: boolean): Promise<void> {
  const frontendDir = path.join(projectRoot, 'frontend');

  if (await dirHasContent(frontendDir)) {
    p.cancel(`De map 'frontend' bestaat al en is niet leeg:\n  ${frontendDir}`);
    process.exitCode = 1;
    return;
  }

  // Altijd de laatste versie via @latest; Tailwind via --tailwind.
  const command =
    'npx create-next-app@latest frontend ' +
    '--ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes';

  p.note(`${chalk.dim('map:')} ${frontendDir}\n${chalk.dim('cmd:')} ${command}`, 'Next.js + TailwindCSS');

  if (dryRun) {
    p.outro(chalk.yellow('dry-run: niets uitgevoerd'));
    return;
  }

  const confirmed = await p.confirm({ message: 'Nu installeren?' });
  if (p.isCancel(confirmed) || !confirmed) {
    p.cancel('Geannuleerd.');
    return;
  }

  p.log.step('Next.js + TailwindCSS installeren...');
  const code = await runInShell(command, projectRoot);

  if (code === 0) {
    p.outro(
      chalk.green('Klaar! ') +
        `Next.js staat in ${chalk.cyan('frontend/')}.  Start met: ${chalk.cyan('cd frontend && npm run dev')}`,
    );
  } else {
    p.log.error(`Installatie mislukt (exit code ${code}).`);
    process.exitCode = code ?? 1;
  }
}

function runInShell(command: string, cwd: string): Promise<number | null> {
  return new Promise((resolve) => {
    const child = spawn(command, { cwd, stdio: 'inherit', shell: true });
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
