import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const apiSource = join(root, 'api');
const apiDest = join(root, 'dist', 'api');

const REQUIRED = ['auth.php', 'db_config.php', 'vendas.php', 'parcelas.php'];

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

if (existsSync(apiDest)) {
  rmSync(apiDest, { recursive: true, force: true });
}

mkdirSync(apiDest, { recursive: true });
copyRecursive(apiSource, apiDest);

const missing = REQUIRED.filter((f) => !existsSync(join(apiDest, f)));
if (missing.length) {
  console.error(`❌ API incompleta em dist/api/. Faltam: ${missing.join(', ')}`);
  process.exit(1);
}

const phpCount = readdirSync(apiDest).filter((f) => f.endsWith('.php')).length;
console.log(`✅ API PHP copiada para dist/api/ (${phpCount} arquivos .php)`);
