import { readFileSync } from 'fs';
import { join } from 'path';
import sizeOf from 'image-size';

const publicDir = join(process.cwd(), 'public');

console.log('📐 Verificando dimensões das imagens do Hero...\n');

// Verificar hero-mobile.png
try {
  const heroMobilePath = join(publicDir, 'hero-mobile.png');
  const heroMobileBuffer = readFileSync(heroMobilePath);
  const heroMobileSize = sizeOf(heroMobileBuffer);
  console.log('📱 HERO MOBILE (hero-mobile.png):');
  console.log(`   Largura: ${heroMobileSize.width}px`);
  console.log(`   Altura: ${heroMobileSize.height}px`);
  console.log(`   Proporção: ${(heroMobileSize.width / heroMobileSize.height).toFixed(2)}:1`);
  console.log(`   Formato: ${heroMobileSize.type?.toUpperCase() || 'PNG'}`);
  console.log('');
} catch (error) {
  console.log('❌ Erro ao ler hero-mobile.png:', error.message);
}

// Verificar Thaty_Lara.png (usada no desktop)
try {
  const thatyLaraPath = join(publicDir, 'Thaty_Lara.png');
  const thatyLaraBuffer = readFileSync(thatyLaraPath);
  const thatyLaraSize = sizeOf(thatyLaraBuffer);
  console.log('💻 HERO DESKTOP - Imagem das Meninas (Thaty_Lara.png):');
  console.log(`   Largura: ${thatyLaraSize.width}px`);
  console.log(`   Altura: ${thatyLaraSize.height}px`);
  console.log(`   Proporção: ${(thatyLaraSize.width / thatyLaraSize.height).toFixed(2)}:1`);
  console.log(`   Formato: ${thatyLaraSize.type?.toUpperCase() || 'PNG'}`);
  console.log(`   Tamanho exibido no desktop: 600px (largura)`);
  console.log('');
} catch (error) {
  console.log('❌ Erro ao ler Thaty_Lara.png:', error.message);
}

console.log('📋 RESUMO DAS ESPECIFICAÇÕES:');
console.log('');
console.log('📱 MOBILE:');
console.log('   - Imagem: hero-mobile.png');
console.log('   - Uso: Imagem completa com todos os elementos');
console.log('   - Comportamento: width: 100%, height: auto');
console.log('   - Altura mínima: calc(100vh - 5rem)');
console.log('');
console.log('💻 DESKTOP:');
console.log('   - Background: Gradiente CSS');
console.log('   - Imagem das meninas: Thaty_Lara.png');
console.log('   - Tamanho exibido: 600px de largura (altura automática)');
console.log('   - Textos e botão: Posicionados absolutamente sobre o gradiente');
