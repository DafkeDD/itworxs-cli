import { runInit } from './commands/init';

const VERSION = '0.1.0';

const HELP = `
itworxs - basis CLI voor ItWorXs projecten

Gebruik:
  itworxs <command>

Commands:
  init       Initialiseer het project
  help       Toon deze hulp
  version    Toon de versie

Opties:
  -h, --help      Toon hulp
  -v, --version   Toon de versie
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === '-v' || command === '--version' || command === 'version') {
    console.log(VERSION);
    return;
  }

  if (!command || command === 'help' || command === '-h' || command === '--help') {
    console.log(HELP);
    return;
  }

  switch (command) {
    case 'init':
      await runInit({ cwd: process.cwd() });
      break;
    default:
      console.error(`Onbekend command: ${command}\n`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

main();
