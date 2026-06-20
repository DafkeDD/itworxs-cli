import path from 'node:path';

export interface InitOptions {
  cwd?: string;
}

/**
 * Basis init command. Doet voorlopig niets aan het bestandssysteem.
 * Vul hier je eigen logica in (bv. een config-bestand of structuur aanmaken).
 */
export async function runInit({ cwd = process.cwd() }: InitOptions = {}): Promise<void> {
  const projectName = path.basename(cwd);
  console.log(`\nitworxs: project "${projectName}" geïnitialiseerd in ${cwd}`);
  console.log('(nog geen acties — bouw dit verder uit in src/commands/init.ts)\n');
}
