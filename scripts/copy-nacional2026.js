import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'fs';
import { join } from 'path';

const rootDir = process.cwd();
const nacionalDir = join(rootDir, 'nacional2026');
const nacionalBuildDir = join(nacionalDir, 'dist');
const nacionalApiDir = join(nacionalDir, 'api');
const distNacionalDir = join(rootDir, 'dist', 'nacional2026');

const ignoredNames = new Set([
  'node_modules',
  'src',
  'dist',
  '.git',
  '.env',
  '.env.local',
  '.env.production',
]);

const ignoredExtensions = new Set(['.sql', '.md', '.map']);

function shouldIgnore(name) {
  const lowerName = name.toLowerCase();
  return (
    ignoredNames.has(name) ||
    Array.from(ignoredExtensions).some((extension) => lowerName.endsWith(extension))
  );
}

function copyRecursive(source, destination) {
  const stats = statSync(source);

  if (stats.isDirectory()) {
    if (!existsSync(destination)) {
      mkdirSync(destination, { recursive: true });
    }

    for (const item of readdirSync(source)) {
      if (shouldIgnore(item)) continue;
      copyRecursive(join(source, item), join(destination, item));
    }
    return;
  }

  copyFileSync(source, destination);
}

console.log('\n🏇 Copiando subdomínio nacional2026 para dist/nacional2026...');

if (!existsSync(nacionalDir)) {
  console.error('❌ Pasta nacional2026/ não encontrada.');
  process.exit(1);
}

if (!existsSync(nacionalBuildDir)) {
  console.error('❌ Build do nacional2026 não encontrado. Execute `npm --prefix nacional2026 run build` antes de copiar.');
  process.exit(1);
}

rmSync(distNacionalDir, { recursive: true, force: true });
mkdirSync(distNacionalDir, { recursive: true });

copyRecursive(nacionalBuildDir, distNacionalDir);
console.log('   ✅ Frontend do nacional2026 copiado');

if (existsSync(nacionalApiDir)) {
  copyRecursive(nacionalApiDir, join(distNacionalDir, 'api'));
  console.log('   ✅ API PHP do nacional2026 copiada');
} else {
  console.warn('   ⚠️  Pasta nacional2026/api não encontrada');
}

console.log('✅ Nacional 2026 disponível em dist/nacional2026\n');
