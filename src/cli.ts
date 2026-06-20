import { runInit } from './commands/init';

const VERSION = '0.2.0';

const HELP = `
itworxs - basis CLI voor ItWorXs projecten

Gebruik:
  itworxs <command> [opties]

Commands:
  init       Zet een frontend op (vraagt welke je wil)
  help       Toon deze hulp
  version    Toon de versie

Opties:
  --dry-run       Toon bij 'init' enkel het commando, voer niets uit
  -h, --help      Toon hulp
  -v, --version   Toon de versie
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
      const dryRun = flags.includes('--dry-run');
      await runInit({ dryRun });
      break;
    }
    default:
      console.error(`Onbekend command: ${command}\n`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

main();
