import path from 'node:path';
import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

// Map waarin de CLI per project geinstalleerd wordt. Wordt 'init' vanuit zo'n
// map gedraaid, dan is de projectroot de map erboven.
const INSTALL_DIR_NAME = 'itworxs-cli';

interface FrontendChoice {
  id: string;
  label: string;
}

const FRONTENDS: FrontendChoice[] = [
  { id: 'nextjs', label: 'Next.js + TailwindCSS (laatste versie)' },
];

export interface InitOptions {
  /** Toon enkel het commando dat gedraaid zou worden, voer niets uit. */
  dryRun?: boolean;
}

/** Bepaal de projectroot (parent als we in de itworxs-cli map zitten). */
function resolveProjectRoot(): string {
  const cwd = process.cwd();
  if (path.basename(cwd) === INSTALL_DIR_NAME) return path.dirname(cwd);
  return cwd;
}

export async function runInit({ dryRun = false }: InitOptions = {}): Promise<void> {
  const projectRoot = resolveProjectRoot();

  const choice = await askFrontend();
  if (!choice) {
    console.error('Geen geldige keuze gemaakt. Gestopt.');
    process.exitCode = 1;
    return;
  }

  if (choice.id === 'nextjs') {
    await installNextjs(projectRoot, dryRun);
  }
}

/** Vraag de gebruiker welke frontend hij wil. */
async function askFrontend(): Promise<FrontendChoice | undefined> {
  const rl = createInterface({ input, output });
  try {
    console.log('\nWelke frontend wil je gebruiken?\n');
    FRONTENDS.forEach((f, i) => console.log(`  ${i + 1}) ${f.label}`));
    const raw = (await rl.question('\nKeuze [1]: ')).trim();
    const answer = raw === '' ? '1' : raw;
    const idx = Number.parseInt(answer, 10) - 1;
    return FRONTENDS[idx];
  } finally {
    rl.close();
  }
}

/** Installeer Next.js + TailwindCSS in de map frontend/ van de projectroot. */
async function installNextjs(projectRoot: string, dryRun: boolean): Promise<void> {
  const frontendDir = path.join(projectRoot, 'frontend');

  if (await dirHasContent(frontendDir)) {
    console.error(`\nDe map 'frontend' bestaat al en is niet leeg:\n  ${frontendDir}`);
    console.error('Verwijder of hernoem die map en probeer opnieuw.\n');
    process.exitCode = 1;
    return;
  }

  // Altijd de laatste versie via @latest; Tailwind via --tailwind.
  const command =
    'npx create-next-app@latest frontend ' +
    '--ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes';

  console.log(`\nNext.js + TailwindCSS installeren in:\n  ${frontendDir}\n`);
  console.log(`Commando: ${command}\n`);

  if (dryRun) {
    console.log('(dry-run: niets uitgevoerd)\n');
    return;
  }

  const code = await runInShell(command, projectRoot);
  if (code === 0) {
    console.log('\nKlaar! Next.js + TailwindCSS staat in de map frontend/.');
    console.log('Starten:\n  cd frontend\n  npm run dev\n');
  } else {
    console.error(`\nInstallatie mislukt (exit code ${code}).\n`);
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
