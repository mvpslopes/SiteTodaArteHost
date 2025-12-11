/**
 * Script para analisar o erro no arquivo JavaScript do Grupo Raça
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const filePath = join(process.cwd(), 'gruporaca', 'dist', 'assets', 'index-QUFP2xS-.js');

try {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  console.log('📊 Análise do arquivo JavaScript do Grupo Raça\n');
  console.log(`Total de linhas: ${lines.length}`);
  console.log(`Tamanho total: ${content.length} caracteres\n`);
  
  // Linha 250 (índice 249)
  if (lines[249]) {
    const line250 = lines[249];
    const errorPos = 3302;
    
    console.log(`Linha 250:`);
    console.log(`  Tamanho: ${line250.length} caracteres`);
    console.log(`  Erro na posição: ${errorPos}\n`);
    
    // Contexto ao redor do erro
    const start = Math.max(0, errorPos - 100);
    const end = Math.min(line250.length, errorPos + 100);
    const context = line250.substring(start, end);
    
    console.log('Contexto ao redor do erro:');
    console.log('─'.repeat(80));
    console.log(context);
    console.log('─'.repeat(80));
    console.log('         ^');
    console.log(`    Posição ${errorPos}\n`);
    
    // Caracteres individuais
    console.log('Caracteres ao redor da posição do erro:');
    for (let i = Math.max(0, errorPos - 10); i <= Math.min(line250.length - 1, errorPos + 10); i++) {
      const char = line250[i];
      const marker = i === errorPos ? ' <-- ERRO AQUI' : '';
      console.log(`  Pos ${i}: '${char}' (código: ${char.charCodeAt(0)})${marker}`);
    }
    
    // Verificar padrões suspeitos
    console.log('\n🔍 Verificando padrões suspeitos...');
    
    // Verificar se há chaves/parenteses desbalanceados na linha
    const openBraces = (line250.match(/\{/g) || []).length;
    const closeBraces = (line250.match(/\}/g) || []).length;
    const openParens = (line250.match(/\(/g) || []).length;
    const closeParens = (line250.match(/\)/g) || []).length;
    
    console.log(`  Chaves: ${openBraces} abertas, ${closeBraces} fechadas (diferença: ${openBraces - closeBraces})`);
    console.log(`  Parênteses: ${openParens} abertos, ${closeParens} fechados (diferença: ${openParens - closeParens})`);
    
    // Verificar caracteres ao redor do erro
    const charBefore = line250[errorPos - 1];
    const charAt = line250[errorPos];
    const charAfter = line250[errorPos + 1];
    
    console.log(`\n  Caractere antes do erro: '${charBefore}'`);
    console.log(`  Caractere no erro: '${charAt}'`);
    console.log(`  Caractere depois do erro: '${charAfter}'`);
    
    // Tentar identificar o padrão
    const beforeContext = line250.substring(Math.max(0, errorPos - 50), errorPos);
    const afterContext = line250.substring(errorPos, Math.min(line250.length, errorPos + 50));
    
    console.log('\n📝 Possíveis causas:');
    if (charAt === '}') {
      console.log('  - Chave de fechamento "}" encontrada onde não deveria estar');
      console.log('  - Pode ser uma chave extra ou falta de abertura antes');
    }
    if (beforeContext.includes('})') && charAt === '}') {
      console.log('  - Possível duplicação de chave de fechamento');
    }
    if (beforeContext.match(/\)\s*\)\s*\}\s*$/)) {
      console.log('  - Possível problema com fechamento de função/componente');
    }
    
    console.log('\n💡 Recomendação:');
    console.log('  O arquivo está corrompido e precisa ser reconstruído a partir do código fonte.');
    console.log('  Verifique SOLUCAO_ERRO_GRUPORACA.md para mais informações.');
    
  } else {
    console.error('❌ Linha 250 não encontrada!');
  }
  
} catch (error) {
  console.error('❌ Erro ao analisar arquivo:', error.message);
  process.exit(1);
}

