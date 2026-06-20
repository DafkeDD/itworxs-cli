import { runInit } from './commands/init';

const VERSION = '0.1.0';

const HELP = `
itworxs - basis CLI voor ItWorXs projecten

Gebruik:
  itworxs <command> [opties]

Commands:
  init            Scaffold het project met een basis structuur
  help            Toon deze hulp
  version         Toon de versie

Opties:
  -t, --target <map>   Doelmap om te scaffolden (standaard: de projectroot)
  -f, --force          Overschrijf bestaande bestanden bij init
  -h, --help           Toon hulp
  -v, --version        Toon de versie

Let op:
  Wordt 'init' gedraaid vanuit een map met de naam 'itworxs-cli', dan
  scaffold het standaard de map erboven (de projectroot). Gebruik --target
  om een andere map te kiezen.

Voorbeelden:
  itworxs init
  itworxs init --force
  itworxs init --target .
`;

function getFlagValue(flags: string[], names: string[]): string | undefined {
  for (const name of names) {
    const idx = flags.indexOf(name);
    if (idx !== -1) return flags[idx + 1];
  }
  return undefined;
}

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
      const target = getFlagValue(flags, ['--target', '-t']);
      await runInit({ force, target });
      break;
    }
    default:
      console.error(`Onbekend command: ${command}\n`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

main();
