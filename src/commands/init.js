import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, '../../templates');

// npm laat .gitignore-bestanden niet toe in packages, daarom heten ze in
// templates/ zonder punt en hernoemen we ze bij het kopieren.
const RENAME_MAP = {
  gitignore: '.gitignore',
};

/**
 * Scaffold de huidige map met een basis projectstructuur.
 * @param {{ force?: boolean, cwd?: string }} options
 */
export async function runInit({ force = false, cwd = process.cwd() } = {}) {
  const projectName = path.basename(cwd);
  console.log(`\nProject initialiseren in: ${cwd}`);

  const files = await collectTemplateFiles(TEMPLATES_DIR);

  if (files.length === 0) {
    console.warn('Geen templates gevonden om te kopieren.');
    return;
  }

  let created = 0;
  let skipped = 0;

  for (const rel of files) {
    const src = path.join(TEMPLATES_DIR, rel);
    const destRel = RENAME_MAP[rel] ?? rel;
    const dest = path.join(cwd, destRel);

    const exists = await pathExists(dest);
    if (exists && !force) {
      console.log(`  overslaan  ${destRel} (bestaat al, gebruik --force)`);
      skipped++;
      continue;
    }

    await fs.mkdir(path.dirname(dest), { recursive: true });
    let content = await fs.readFile(src, 'utf8');
    content = content.replaceAll('{{PROJECT_NAME}}', projectName);
    await fs.writeFile(dest, content);
    console.log(`  ${exists ? 'overschreven' : 'aangemaakt '} ${destRel}`);
    created++;
  }

  console.log(`\nKlaar. ${created} bestand(en) aangemaakt, ${skipped} overgeslagen.\n`);
}

async function collectTemplateFiles(dir, base = dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectTemplateFiles(full, base)));
    } else {
      out.push(path.relative(base, full));
    }
  }
  return out;
}

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}
