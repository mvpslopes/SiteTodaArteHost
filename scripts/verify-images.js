import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Script para verificar se todas as imagens necessárias estão presentes
 * antes do deploy para produção
 */

const publicDir = join(process.cwd(), 'public');
const distDir = join(process.cwd(), 'dist');

// Lista de imagens essenciais que devem estar presentes
const essentialImages = [
  // Imagens principais do site
  'hero-mobile.png',
  'Thaty_Lara.png',
  'logo.png',
  'favicon.png',
];

console.log('🔍 Verificando imagens para produção...\n');

let hasErrors = false;

// Verificar imagens essenciais
console.log('📸 Verificando imagens essenciais:');
essentialImages.forEach(img => {
  const publicPath = join(publicDir, img);
  const distPath = join(distDir, img);
  
  const existsInPublic = existsSync(publicPath);
  const existsInDist = existsSync(distPath);
  
  if (existsInPublic) {
    console.log(`   ✅ ${img} (public/)`);
  } else {
    console.log(`   ❌ ${img} (public/) - FALTANDO!`);
    hasErrors = true;
  }
  
  if (existsInDist) {
    console.log(`   ✅ ${img} (dist/)`);
  } else {
    console.log(`   ⚠️  ${img} (dist/) - Será copiado no build`);
  }
});

// Verificar pasta de parceiros
console.log('\n📸 Verificando imagens de parceiros:');
const partnersDir = join(publicDir, 'partners');
if (existsSync(partnersDir)) {
  const partnerFiles = readdirSync(partnersDir).filter(f => 
    /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f)
  );
  console.log(`   ✅ ${partnerFiles.length} imagens encontradas em partners/`);
  partnerFiles.forEach(file => {
    console.log(`      - ${file}`);
  });
} else {
  console.log('   ⚠️  Pasta partners/ não encontrada');
}

console.log('\n' + '='.repeat(60));

if (hasErrors) {
  console.log('❌ ERROS ENCONTRADOS! Corrija antes de fazer o deploy.');
  console.log('\n💡 Dicas:');
  console.log('   1. Execute: npm run build');
  console.log('   2. Verifique se todas as imagens estão em public/');
  console.log('   3. Execute este script novamente: node scripts/verify-images.js');
  process.exit(1);
} else {
  console.log('✅ Todas as imagens essenciais estão presentes!');
  console.log('✅ Pronto para deploy na Hostinger!');
  process.exit(0);
}

