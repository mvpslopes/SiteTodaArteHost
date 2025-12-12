import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Script para copiar TODAS as imagens necessárias para o dist/ após o build
 * Garante que todas as imagens estejam disponíveis em produção
 */

const publicDir = join(process.cwd(), 'public');
const distDir = join(process.cwd(), 'dist');

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
    const ext = fileName.split('.').pop()?.toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'ico', 'bmp', 'tiff'];
    const staticExts = ['css', 'js', 'json', 'xml', 'txt', 'pdf'];
    
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

// Copiar pasta gruporaca/ completa
console.log('\n📁 Copiando pasta gruporaca/...');
const gruporacaSrc = join(publicDir, 'gruporaca');
const gruporacaDest = join(distDir, 'gruporaca');
if (existsSync(gruporacaSrc)) {
  copyRecursive(gruporacaSrc, gruporacaDest);
  console.log('   ✅ Pasta gruporaca/ copiada');
} else {
  console.log('   ⚠️  Pasta gruporaca/ não encontrada');
}

// Copiar imagens do Grupo Raça para a raiz também (compatibilidade)
console.log('\n📁 Copiando imagens do Grupo Raça para raiz (compatibilidade)...');
const gruporacaImages = [
  'logo.png',
  'logo-todaarte.png',
  'favicon.png',
  'Leilao-08-13-12.jpg',
  'Leilao-09a13-12.jpg',
  'Leilao-11-12-25.jpg',
  'Leilao-15-20-12.jpg',
  'foto-ariane.png',
  'foto-ariane-fundo.JPG',
  'logo-ariane-andrade.png',
  'logo-ariane-andrade-fundo.png',
  'arte-ariane-horizontal.png',
  'arte-ariane-vertical.png',
];

gruporacaImages.forEach(img => {
  const src = join(gruporacaSrc, img);
  const dest = join(distDir, img);
  
  if (existsSync(src)) {
    try {
      copyFileSync(src, dest);
      console.log(`   ✅ ${img}`);
    } catch (error) {
      console.error(`   ❌ ${img}:`, error.message);
    }
  }
});

console.log('\n✅ Todas as imagens foram copiadas para dist/!');

