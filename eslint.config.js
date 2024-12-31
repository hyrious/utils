import fs from 'node:fs';
import tsparser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.Config} */
export default {
  ignores: fs.readFileSync('.gitignore', 'utf8').split('\n').filter(e => e && e[0] != '#'),
  files: ['src/**/*.ts'],
  languageOptions: {
    parser: tsparser
  }
};
