/**
 * Script para reconstruir o projeto do Grupo Raça
 * Execute este script se o arquivo JavaScript do Grupo Raça estiver corrompido
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const gruporacaDir = join(process.cwd(), 'gruporaca');

console.log('🔧 Verificando projeto do Grupo Raça...\n');

if (!existsSync(gruporacaDir)) {
  console.error('❌ Diretório "gruporaca" não encontrado!');
  console.error('   Certifique-se de que o projeto do Grupo Raça está na pasta "gruporaca"');
  process.exit(1);
}

const packageJson = join(gruporacaDir, 'package.json');
const distDir = join(gruporacaDir, 'dist');

if (!existsSync(packageJson)) {
  console.warn('⚠️  Arquivo package.json não encontrado em "gruporaca"!');
  console.warn('   A pasta "gruporaca" contém apenas arquivos compilados (dist).\n');
  
  if (existsSync(distDir)) {
    console.log('📁 Estrutura encontrada:');
    console.log('   gruporaca/');
    console.log('   └── dist/  (arquivos já compilados)\n');
    console.log('💡 Opções para resolver o problema:\n');
    console.log('   Opção 1: Se você tem o projeto fonte do Grupo Raça em outro lugar:');
    console.log('   1. Navegue até a pasta do projeto fonte do Grupo Raça');
    console.log('   2. Execute: npm install');
    console.log('   3. Execute: npm run build');
    console.log('   4. Copie a pasta "dist" para: ' + gruporacaDir);
    console.log('   5. Execute novamente: npm run rebuild-gruporaca\n');
    console.log('   Opção 2: Se você não tem o projeto fonte:');
    console.log('   - Entre em contato com quem desenvolveu o projeto do Grupo Raça');
    console.log('   - Solicite uma nova build do projeto ou o código fonte\n');
    console.log('   Opção 3: Verificar se há backup do projeto:');
    console.log('   - Procure por uma pasta com o código fonte do Grupo Raça');
    console.log('   - Ou verifique se há um repositório Git com o projeto\n');
  } else {
    console.error('❌ Pasta "dist" também não encontrada!');
    console.error('   A pasta "gruporaca" está vazia ou não existe.');
  }
  
  process.exit(1);
}

console.log('📦 Instalando dependências do Grupo Raça...');
try {
  execSync('npm install', { 
    cwd: gruporacaDir, 
    stdio: 'inherit',
    shell: true 
  });
  console.log('✅ Dependências instaladas!\n');
} catch (error) {
  console.error('❌ Erro ao instalar dependências:', error.message);
  process.exit(1);
}

console.log('🏗️  Construindo projeto do Grupo Raça...');
try {
  execSync('npm run build', { 
    cwd: gruporacaDir, 
    stdio: 'inherit',
    shell: true 
  });
  console.log('✅ Build concluído!\n');
} catch (error) {
  console.error('❌ Erro ao construir projeto:', error.message);
  process.exit(1);
}

console.log('📁 Copiando arquivos para public/gruporaca...');
try {
  execSync('node scripts/copy-gruporaca.js', { 
    cwd: process.cwd(), 
    stdio: 'inherit',
    shell: true 
  });
  console.log('✅ Arquivos copiados com sucesso!\n');
} catch (error) {
  console.error('❌ Erro ao copiar arquivos:', error.message);
  process.exit(1);
}

console.log('🎉 Reconstrução do Grupo Raça concluída com sucesso!');
console.log('   Você pode agora testar a página em: http://localhost:5173/gruporaca');

