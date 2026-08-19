/**
 * Gera pastas separadas para deploy na Hostinger — evita enviar o app errado ao domínio principal.
 *
 * deploy/hostinger/todaarte.com.br/     → public_html do domínio principal
 * deploy/hostinger/gestao/             → subdomínio gestao.todaarte.com.br
 * deploy/hostinger/nacional2026/       → subdomínio nacional2026.todaarte.com.br
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, readFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const dist = join(root, 'dist');
const out = join(root, 'deploy', 'hostinger');

const targets = [
  {
    name: 'todaarte.com.br',
    source: dist,
    exclude: new Set(['financeiro', 'gestao', 'nacional2026']),
    mustContain: 'Toda Arte',
    mustNotContain: 'Nacional 2026',
  },
  {
    name: 'gestao',
    source: join(dist, 'gestao'),
    exclude: new Set(),
    mustContain: 'Sistema Financeiro',
    requireApi: true,
  },
  {
    name: 'nacional2026',
    source: join(dist, 'nacional2026'),
    exclude: new Set(),
    mustContain: 'Nacional 2026',
    mustNotContain: 'Toda Arte - Transformamos',
    requireApi: true,
  },
];

function shouldIgnore(name, exclude) {
  return exclude.has(name);
}

function copyRecursive(source, destination, exclude) {
  const stats = statSync(source);
  if (stats.isDirectory()) {
    if (!existsSync(destination)) mkdirSync(destination, { recursive: true });
    for (const item of readdirSync(source)) {
      if (shouldIgnore(item, exclude)) continue;
      copyRecursive(join(source, item), join(destination, item), exclude);
    }
    return;
  }
  copyFileSync(source, destination);
}

function verifyIndexHtml(destDir, mustContain, mustNotContain) {
  const indexPath = join(destDir, 'index.html');
  if (!existsSync(indexPath)) {
    console.error(`❌ ${destDir}: index.html não encontrado`);
    process.exit(1);
  }
  const html = readFileSync(indexPath, 'utf8');
  if (!html.includes(mustContain)) {
    console.error(`❌ ${destDir}: index.html não contém "${mustContain}"`);
    process.exit(1);
  }
  if (mustNotContain && html.includes(mustNotContain)) {
    console.error(`❌ ${destDir}: index.html contém conteúdo incorreto ("${mustNotContain}")`);
    process.exit(1);
  }
}

function verifyApi(destDir) {
  const apiDir = join(destDir, 'api');
  const auth = join(apiDir, 'auth.php');
  if (!existsSync(apiDir) || !existsSync(auth)) {
    console.error(`❌ ${destDir}: pasta api/ ausente ou incompleta (falta api/auth.php)`);
    process.exit(1);
  }
  const phpCount = readdirSync(apiDir).filter((f) => f.endsWith('.php')).length;
  console.log(`      · api/ ok (${phpCount} .php)`);
}
console.log('\n📦 Empacotando deploys para Hostinger...\n');

if (!existsSync(dist)) {
  console.error('❌ Pasta dist/ não encontrada. Execute `npm run build` primeiro.');
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const t of targets) {
  if (!existsSync(t.source)) {
    console.error(`❌ Build não encontrado: ${t.source}`);
    console.error('   Execute `npm run build` na raiz do projeto.');
    process.exit(1);
  }

  const dest = join(out, t.name);
  copyRecursive(t.source, dest, t.exclude);
  verifyIndexHtml(dest, t.mustContain, t.mustNotContain);
  console.log(`   ✅ ${t.name}/`);
  if (t.requireApi) verifyApi(dest);
}
console.log(`
✅ Pacotes prontos em deploy/hostinger/

   DOMÍNIO PRINCIPAL (todaarte.com.br)
   → Envie o conteúdo de deploy/hostinger/todaarte.com.br/ para public_html
   → NÃO envie nacional2026 nem gestao para a raiz!

   SUBDOMÍNIO gestao.todaarte.com.br
   → Envie deploy/hostinger/gestao/

   SUBDOMÍNIO nacional2026.todaarte.com.br
   → Envie deploy/hostinger/nacional2026/
`);
