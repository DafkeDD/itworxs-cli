import { runInit } from './commands/init';

const VERSION = '0.1.0';

const HELP = `
itworxs - basis CLI voor ItWorXs projecten

Gebruik:
  itworxs <command> [opties]

Commands:
  init            Scaffold de huidige map met een basis projectstructuur
  help            Toon deze hulp
  version         Toon de versie

Opties:
  -f, --force     Overschrijf bestaande bestanden bij init
  -h, --help      Toon hulp
  -v, --version   Toon de versie

Voorbeelden:
  itworxs init
  itworxs init --force
`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0];
  const flags = args.slice(1);

  if (command === '-v' || command === '--version' || command === 'version') {
    console.log(VERSION);
    return;
  }

  if (!command || command === 'help' || command === '-h' || command === '--help') {
    console.log(HELP);
    return;
  }

  switch (command) {
    case 'init': {
      const force = flags.includes('-f') || flags.includes('--force');
      await runInit({ force, cwd: process.cwd() });
      break;
    }
    default:
      console.error(`Onbekend command: ${command}\n`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

main();
