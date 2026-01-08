import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Script para copiar TODAS as imagens necessárias para o dist/ após o build
 * Garante que todas as imagens estejam disponíveis em produção
 */

const publicDir = join(process.cwd(), 'public');
const distDir = join(process.cwd(), 'dist');

// Lista de arquivos que NÃO devem ser copiados
const excludedFiles = [
  'close-up-no-cavalo-ao-ar-livre.jpg',
  'favicon.psd',
  'foto-ariane.png',
  'foto-ariane-fundo.JPG',
  'lindo-cavalo-castanho-close-up-focinho-aparencia-bonita-juba-plano-de-fundo-campo-de-atletismo-curral-arvores-cavalos-sao-animais-maravilhosos.jpg',
  'lindo-cavalo-marrom-ao-ar-livre.jpg',
  'logo-ariane-andrade.png',
  'logo-ariane-andrade-fundo.png',
  'rebanho-de-cavalos-correndo-pela-agua.jpg',
];

function copyRecursive(src, dest) {
  if (!existsSync(src)) {
    console.log(`⚠️  Diretório não encontrado: ${src}`);
    return;
  }

  const stats = statSync(src);
  
  if (stats.isDirectory()) {
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    
    const files = readdirSync(src);
    files.forEach(file => {
      const srcPath = join(src, file);
      const destPath = join(dest, file);
      copyRecursive(srcPath, destPath);
    });
  } else {
    // Copiar apenas arquivos de imagem e outros estáticos
    const fileName = src.split(/[/\\]/).pop() || '';
    
    // Verificar se o arquivo está na lista de exclusão
    if (excludedFiles.includes(fileName)) {
      return; // Pular este arquivo
    }
    
    const ext = fileName.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp', 'tiff'];
    const staticExts = ['css', 'js', 'json', 'xml', 'txt', 'pdf'];
    
    // Não copiar arquivos .psd
    if (ext === 'psd') {
      return;
    }
    
    if (ext && (imageExts.includes(ext) || staticExts.includes(ext) || fileName === '.htaccess')) {
      try {
        copyFileSync(src, dest);
      } catch (error) {
        console.error(`❌ Erro ao copiar ${src}:`, error.message);
      }
    }
  }
}

console.log('📸 Copiando todas as imagens para dist/...\n');

// Copiar imagens da raiz de public/
console.log('📁 Copiando imagens da raiz...');
const rootImages = [
  'hero-mobile.png',
  'Thaty_Lara.png',
  'favicon.png',
  'logo.png',
  'manifest.json',
  'sw.js',
];

rootImages.forEach(img => {
  const src = join(publicDir, img);
  const dest = join(distDir, img);
  
  if (existsSync(src)) {
    try {
      copyFileSync(src, dest);
      console.log(`   ✅ ${img}`);
    } catch (error) {
      console.error(`   ❌ ${img}:`, error.message);
    }
  } else {
    console.log(`   ⚠️  ${img} não encontrado (opcional)`);
  }
});

// Copiar pasta partners/
console.log('\n📁 Copiando pasta partners/...');
const partnersSrc = join(publicDir, 'partners');
const partnersDest = join(distDir, 'partners');
if (existsSync(partnersSrc)) {
  copyRecursive(partnersSrc, partnersDest);
  console.log('   ✅ Pasta partners/ copiada');
} else {
  console.log('   ⚠️  Pasta partners/ não encontrada');
}

console.log('\n✅ Todas as imagens foram copiadas para dist/!');

