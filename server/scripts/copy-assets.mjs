/** Copies non-TS build assets that tsc doesn't emit (the generated knowledge JSON). */
import { copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
copyFileSync(join(root, 'src/knowledge/prodigi-knowledge.json'), join(root, 'dist/knowledge/prodigi-knowledge.json'));
console.log('Copied prodigi-knowledge.json → dist/knowledge/');
