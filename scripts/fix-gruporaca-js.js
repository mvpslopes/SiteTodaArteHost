/**
 * Script para tentar corrigir o arquivo JavaScript corrompido do Grupo Raça
 * ATENÇÃO: Esta é uma correção experimental. Faça backup antes de usar!
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const sourceFile = join(process.cwd(), 'gruporaca', 'dist', 'assets', 'index-QUFP2xS-.js');
const destFile = join(process.cwd(), 'public', 'gruporaca', 'assets', 'index-QUFP2xS-.js');
const backupFile = join(process.cwd(), 'gruporaca', 'dist', 'assets', 'index-QUFP2xS-.js.backup');

console.log('🔧 Tentando corrigir arquivo JavaScript do Grupo Raça...\n');

try {
  // Fazer backup primeiro
  if (!existsSync(backupFile)) {
    console.log('📦 Criando backup do arquivo original...');
    copyFileSync(sourceFile, backupFile);
    console.log(`✅ Backup criado: ${backupFile}\n`);
  } else {
    console.log('ℹ️  Backup já existe, pulando criação...\n');
  }

  // Ler o arquivo
  let content = readFileSync(sourceFile, 'utf8');
  const originalLength = content.length;
  
  console.log(`📄 Arquivo original: ${originalLength} caracteres`);
  
  // Dividir em linhas
  const lines = content.split('\n');
  const line250 = lines[249]; // Linha 250 (índice 249)
  
  if (!line250) {
    console.error('❌ Linha 250 não encontrada!');
    process.exit(1);
  }
  
  console.log(`📏 Linha 250: ${line250.length} caracteres\n`);
  
  // Posição do erro: 3302
  const errorPos = 3302;
  
  // Analisar o contexto
  const beforeError = line250.substring(Math.max(0, errorPos - 50), errorPos);
  const atError = line250[errorPos];
  const afterError = line250.substring(errorPos + 1, Math.min(line250.length, errorPos + 50));
  
  console.log('🔍 Análise do erro:');
  console.log(`   Antes: ...${beforeError.substring(beforeError.length - 30)}`);
  console.log(`   No erro: '${atError}' (posição ${errorPos})`);
  console.log(`   Depois: ${afterError.substring(0, 30)}...\n`);
  
  // Verificar padrão: parece ser um fechamento excessivo
  // Padrão observado: ...})]})]})})...
  // O erro está no último parêntese antes da vírgula
  
  // Verificar balanceamento
  const openBraces = (line250.match(/\{/g) || []).length;
  const closeBraces = (line250.match(/\}/g) || []).length;
  const openParens = (line250.match(/\(/g) || []).length;
  const closeParens = (line250.match(/\)/g) || []).length;
  
  const braceDiff = openBraces - closeBraces;
  const parenDiff = openParens - closeParens;
  
  console.log(`   Balanceamento na linha 250:`);
  console.log(`     Chaves: ${openBraces} abertas, ${closeBraces} fechadas (diferença: ${braceDiff})`);
  console.log(`     Parênteses: ${openParens} abertos, ${closeParens} fechados (diferença: ${parenDiff})\n`);
  
  console.log('🔧 Aplicando correção...\n');
  
  let fixedLine = line250;
  let fixApplied = false;
  
  // Sabemos que há 1 parêntese a mais e o erro está na posição 3302
  // O caractere na posição 3302 é ')' e está seguido de ','
  // Vamos remover esse parêntese extra
  if (atError === ')' && parenDiff === 1) {
    console.log('   Removendo parêntese de fechamento extra na posição 3302...');
    fixedLine = line250.substring(0, errorPos) + line250.substring(errorPos + 1);
    fixApplied = true;
    console.log('   ✅ Parêntese removido\n');
  } else if (atError === ')') {
    // Mesmo que o balanceamento não seja exato, se o erro está em um ')', vamos tentar remover
    console.log('   Removendo parêntese na posição do erro (correção experimental)...');
    fixedLine = line250.substring(0, errorPos) + line250.substring(errorPos + 1);
    fixApplied = true;
    console.log('   ✅ Parêntese removido (experimental)\n');
  }
  
  if (fixApplied) {
    // Substituir a linha 250 corrigida
    lines[249] = fixedLine;
    content = lines.join('\n');
    
    console.log(`✅ Correção aplicada!`);
    console.log(`   Tamanho original: ${originalLength} caracteres`);
    console.log(`   Tamanho após correção: ${content.length} caracteres`);
    console.log(`   Diferença: ${content.length - originalLength} caracteres\n`);
    
    // Salvar arquivo corrigido
    console.log('💾 Salvando arquivo corrigido...');
    writeFileSync(sourceFile, content, 'utf8');
    console.log(`✅ Arquivo fonte corrigido: ${sourceFile}\n`);
    
    // Copiar para public
    console.log('📁 Copiando para public/gruporaca...');
    writeFileSync(destFile, content, 'utf8');
    console.log(`✅ Arquivo copiado: ${destFile}\n`);
    
    console.log('🎉 Correção concluída!');
    console.log('   Recarregue a página no navegador para testar.\n');
    console.log('⚠️  NOTA: Se o erro persistir, você precisará reconstruir o projeto do Grupo Raça.');
    console.log('   Verifique SOLUCAO_ERRO_GRUPORACA.md para mais informações.\n');
    
  } else {
    console.log('❌ Não foi possível aplicar correção automática.');
    console.log('   O problema pode ser mais complexo do que uma simples remoção de caractere.');
    console.log('   Recomendação: Reconstrua o projeto do Grupo Raça a partir do código fonte.\n');
    process.exit(1);
  }
  
} catch (error) {
  console.error('❌ Erro ao processar arquivo:', error.message);
  console.error(error.stack);
  process.exit(1);
}

