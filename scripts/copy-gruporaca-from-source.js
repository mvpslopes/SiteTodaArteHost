/**
 * Script para copiar o build do Grupo Raça da pasta GrupoRaca_ para gruporaca
 */

import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

const sourceDir = join(process.cwd(), 'GrupoRaca_', 'dist');
const targetDir = join(process.cwd(), 'gruporaca', 'dist');

console.log('📁 Copiando build do Grupo Raça...\n');
console.log(`   Origem: ${sourceDir}`);
console.log(`   Destino: ${targetDir}\n`);

if (!existsSync(sourceDir)) {
  console.error(`❌ Diretório fonte não encontrado: ${sourceDir}`);
  console.error('   Certifique-se de que o build foi executado em GrupoRaca_');
  process.exit(1);
}

function copyRecursive(src, dest) {
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
    copyFileSync(src, dest);
  }
}

try {
  // Limpar destino se existir
  if (existsSync(targetDir)) {
    console.log('🗑️  Removendo pasta destino antiga...');
    // Não vamos remover recursivamente aqui, apenas copiar por cima
  }
  
  // Criar diretório destino
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
  
  // Copiar arquivos
  console.log('📋 Copiando arquivos...');
  copyRecursive(sourceDir, targetDir);
  
  console.log('✅ Arquivos copiados com sucesso!\n');
  
  console.log('\n✅ Build copiado para gruporaca/dist!');
  console.log('   Agora execute: node scripts/copy-gruporaca.js');
  console.log('   Ou simplesmente recarregue a página - o servidor deve detectar as mudanças.\n');
  
} catch (error) {
  console.error('❌ Erro ao copiar arquivos:', error.message);
  process.exit(1);
}

