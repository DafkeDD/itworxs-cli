import { generateKeyPairSync, randomUUID } from 'node:crypto';

interface BackendJob { dir: string; build: string }

function generateJwks(): { keys: Record<string, unknown>[] } {
  const { privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = privateKey.export({ format: 'jwk' }) as unknown as Record<string, unknown>;
  jwk.use = 'sig';
  jwk.alg = 'RS256';
  jwk.kid = randomUUID();
  return { keys: [jwk] };
}

function buildCiYaml(hasFrontend: boolean, backends: BackendJob[]): string {
  const job = (name: string, dir: string, buildCmd: string): string => `${name} ${dir} ${buildCmd}`;
  const jobs: string[] = [];
  if (hasFrontend) jobs.push(job('frontend', 'frontend', 'npm run build'));
  for (const b of backends) jobs.push(job(b.dir, b.dir, b.build));
  return jobs.join('\n');
}

const backends: BackendJob[] = [];
backends.push({ dir: 'oidc', build: 'npm run typecheck' });
console.log(generateJwks().keys.length, buildCiYaml(true, backends));
