/// <reference lib="ESNext" />

import ts from 'typescript';
import dts from 'rollup-plugin-dts';
import { Plugin, rollup } from 'rollup';
import { basename, dirname, extname, join, relative } from 'path';
import { rmSync, writeFileSync } from 'fs';

class Output {
  readonly files: Record<string, string> = Object.create(null);
  readonly writeFile: ts.WriteFileCallback = (fileName, text) => {
    text = text.split('\n').map(line => {
      let m = line.match(/^[ ]*/)!;
      let n = Math.floor(m[0].length / 4);
      if (n) {
        return '\t'.repeat(n) + line.slice(n * 4);
      }
      return line;
    }).join('\n');
    this.files[relative(process.cwd(), fileName).replaceAll('\\', '/')] = text;
  };
  constructor(fileNames: string[]) {
    let indexJS: string[] = [];
    for (let fileName of fileNames) {
      if (fileName.startsWith('src/')) {
        let file = basename(fileName.slice(4), '.ts');
        let text = `export * from './${file}';\n`;
        indexJS.push(text);
      }
    }
    this.files['src/index.js'] = this.files['src/index.d.ts'] = indexJS.join('');
  }
  get(path: string): string | undefined {
    return this.files[path];
  }
}

let { config: json } = ts.readConfigFile('tsconfig.json', ts.sys.readFile);
let { options, fileNames } = ts.parseJsonConfigFileContent(json, ts.sys, '.');
options.noEmit = false;
options.declaration = true;
let host = ts.createCompilerHost(options);
let program = ts.createProgram(fileNames, options, host);
let out = new Output(fileNames), result = program.emit(void 0, out.writeFile);
if (result.emitSkipped) {
  process.exit(1);
}

const plugin = (ext = '.js'): Plugin => ({
  name: 'typescript',
  resolveId(id, base) {
    let full = base && id[0] == '.' ? join(dirname(base), id).replaceAll('\\', '/') : id;
    if (!extname(full)) full += ext;
    if (out.get(full) != null) return full;
  },
  load(id) {
    return out.get(id);
  }
});

rmSync('dist', { recursive: true, force: true });

const build = await rollup({
  input: ['src/index.js'],
  plugins: [plugin()]
});

await build.write({
  file: 'dist/index.js',
  externalLiveBindings: false
});

await build.write({
  name: 'hyrious_utils',
  file: 'dist/index.umd.js',
  format: 'umd',
});

const dtsBuild = await rollup({
  input: ['src/index.d.ts'],
  plugins: [plugin('.d.ts'), dts()]
});

await dtsBuild.write({
  file: 'dist/index.d.ts'
});

// Test tree-shaking.
import esbuild from 'esbuild';

writeFileSync('dist/package.json', '{"sideEffects": true}');
const { outputFiles: [{ text }] } = await esbuild.build({
  stdin: {
    contents: "import './dist/index.js';",
    resolveDir: process.cwd(),
  },
  bundle: true,
  platform: 'neutral',
  write: false,
});
rmSync('dist/package.json');

console.assert(text == '', 'Tree-shaking failed');
