import { runInit } from './commands/init';

const VERSION = '0.10.2';

const HELP = `
itworxs - basis CLI voor ItWorXs projecten

Gebruik:
  itworxs <command> [opties]

Commands:
  init       Project setup (vraagt frontend en backend)
  help       Toon deze hulp
  version    Toon de versie

Opties bij init:
  --frontend <naam>   Sla de frontend-vraag over (bv. nextjs, none)
  --backend <naam>    Sla de backend-vraag over (bv. node-express, none)
  --database <naam>   Sla de database-vraag over (bv. postgresql, none)
  --auth <lijst>      Login-providers, komma-gescheiden (bv. google,github)
  --dry-run           Toon enkel wat er zou gebeuren, voer niets uit

Algemeen:
  -h, --help          Toon hulp
  -v, --version       Toon de versie
`;

function getFlagValue(flags: string[], name: string): string | undefined {
  const idx = flags.indexOf(name);
  if (idx !== -1) return flags[idx + 1];
  const withEq = flags.find((f) => f.startsWith(`${name}=`));
  return withEq ? withEq.split('=').slice(1).join('=') : undefined;
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
      const dryRun = flags.includes('--dry-run');
      const frontend = getFlagValue(flags, '--frontend');
      const backend = getFlagValue(flags, '--backend');
      const database = getFlagValue(flags, '--database');
      const auth = getFlagValue(flags, '--auth');
      await runInit({ dryRun, frontend, backend, database, auth });
      break;
    }
    default:
      console.error(`Onbekend command: ${command}\n`);
      console.log(HELP);
      process.exitCode = 1;
  }
}

main();
