import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/cli.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  // shebang zodat de gebundelde dist/cli.js direct uitvoerbaar is
  banner: { js: '#!/usr/bin/env node' },
});
