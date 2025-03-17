import { build } from 'esbuild';
import { writeFileSync, rmSync } from 'node:fs';

try {
  writeFileSync('dist/package.json', '{"sideEffects": true}');
  const { outputFiles: [{ text }] } = await build({
    stdin: {
      contents: "import './dist/index.js';",
      resolveDir: process.cwd(),
    },
    bundle: true,
    platform: 'neutral',
    write: false,
  });

  console.assert(text == '', '✗ Tree-shaking failed');
} finally {
  rmSync('dist/package.json', { force: true });
}
