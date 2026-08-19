import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'fs';
import { join } from 'path';

const rootDir = process.cwd();
const financeiroDir = join(rootDir, 'financeiro');
const financeiroBuildDir = join(financeiroDir, 'dist');
const financeiroApiDir = join(financeiroDir, 'api');
const distFinanceiroDir = join(rootDir, 'dist', 'gestao');

const ignoredNames = new Set([
  'node_modules',
  'src',
  'dist',
  '.git',
  '.env',
  '.env.local',
  '.env.production',
]);

const ignoredExtensions = new Set([
  '.sql',
  '.md',
  '.map',
]);

function shouldIgnore(name) {
  const lowerName = name.toLowerCase();
  return (
    ignoredNames.has(name) ||
    Array.from(ignoredExtensions).some(extension => lowerName.endsWith(extension))
  );
}

function copyRecursive(source, destination) {
  const stats = statSync(source);

  if (stats.isDirectory()) {
    if (!existsSync(destination)) {
      mkdirSync(destination, { recursive: true });
    }

    for (const item of readdirSync(source)) {
      if (shouldIgnore(item)) {
        continue;
      }

      copyRecursive(join(source, item), join(destination, item));
    }

    return;
  }

  copyFileSync(source, destination);
}

console.log('\n💼 Copiando sistema financeiro para dist/gestao (subdomínio gestao.todaarte.com.br)...');

if (!existsSync(financeiroDir)) {
  console.error('❌ Pasta financeiro/ não encontrada.');
  process.exit(1);
}

if (!existsSync(financeiroBuildDir)) {
  console.error('❌ Build do financeiro não encontrado. Execute `npm --prefix financeiro run build` antes de copiar.');
  process.exit(1);
}

rmSync(distFinanceiroDir, { recursive: true, force: true });
mkdirSync(distFinanceiroDir, { recursive: true });

copyRecursive(financeiroBuildDir, distFinanceiroDir);
console.log('   ✅ Frontend do financeiro copiado');

if (existsSync(financeiroApiDir)) {
  copyRecursive(financeiroApiDir, join(distFinanceiroDir, 'api'));
  console.log('   ✅ API PHP do financeiro copiada');
} else {
  console.warn('   ⚠️  Pasta financeiro/api não encontrada');
}

console.log('✅ Financeiro disponível em dist/gestao\n');
