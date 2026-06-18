import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const apiSource = join(root, 'api');
const apiDest = join(root, 'dist', 'api');

function copyRecursive(source, destination) {
  const stats = statSync(source);
  if (stats.isDirectory()) {
    if (!existsSync(destination)) mkdirSync(destination, { recursive: true });
    for (const item of readdirSync(source)) {
      copyRecursive(join(source, item), join(destination, item));
    }
    return;
  }
  copyFileSync(source, destination);
}

if (!existsSync(apiSource)) {
  console.error('❌ Pasta api/ não encontrada.');
  process.exit(1);
}

copyRecursive(apiSource, apiDest);
console.log('✅ API PHP copiada para dist/api/');
