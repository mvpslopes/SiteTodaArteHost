/**
 * Script para atualizar o Grupo Raça rapidamente
 * Faz build e copia tudo automaticamente em um único comando
 */

import { execSync } from 'child_process';
import { join } from 'path';

console.log('🚀 Atualizando Grupo Raça...\n');

try {
  // 1. Build do Grupo Raça
  console.log('📦 Fazendo build do Grupo Raça...');
  execSync('npm run build', {
    cwd: join(process.cwd(), 'GrupoRaca_'),
    stdio: 'inherit',
    shell: true
  });

  // 2. Copiar arquivos (tudo em sequência)
  console.log('\n📁 Copiando arquivos...');
  execSync('node scripts/copy-gruporaca-from-source.js && node scripts/copy-gruporaca.js', {
    cwd: process.cwd(),
    stdio: 'inherit',
    shell: true
  });

  console.log('\n🎉 Atualização concluída!');
  console.log('   Recarregue a página no navegador para ver as mudanças.\n');

} catch (error) {
  console.error('\n❌ Erro ao atualizar:', error.message);
  process.exit(1);
}

