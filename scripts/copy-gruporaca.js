import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const sourceDir = join(process.cwd(), 'gruporaca', 'dist');
const targetDir = join(process.cwd(), 'public', 'gruporaca');

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
    // Se for o index.html, corrige os caminhos antes de copiar
    const fileName = src.split(/[/\\]/).pop();
    if (fileName === 'index.html') {
      let content = readFileSync(src, 'utf8');
      // Remove a tag <base> PRIMEIRO - causa duplicação de caminhos
      content = content.replace(/<base[^>]*>/gi, '');
      // Corrige caminhos absolutos para relativos ao /gruporaca/
      content = content.replace(/src="\/assets\//g, 'src="/gruporaca/assets/');
      content = content.replace(/href="\/assets\//g, 'href="/gruporaca/assets/');
      // Atualiza título e meta tags
      content = content.replace(/<title>.*<\/title>/, '<title>Grupo Raça - Leilões de Cavalos de Elite</title>');
      content = content.replace(/lang="en"/, 'lang="pt-BR"');
      writeFileSync(dest, content, 'utf8');
    } else if (fileName.endsWith('.js')) {
      // Valida o arquivo JavaScript antes de copiar
      try {
        const content = readFileSync(src, 'utf8');
        // Verifica se o arquivo não está vazio e tem estrutura básica válida
        if (content.length === 0) {
          console.warn(`⚠️  Arquivo JavaScript vazio: ${src}`);
          return;
        }
        
        // Verifica se há parênteses/chaves balanceados (verificação básica)
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        const openParens = (content.match(/\(/g) || []).length;
        const closeParens = (content.match(/\)/g) || []).length;
        
        // Verifica se há caracteres inválidos ou sequências suspeitas
        const suspiciousPatterns = [
          /}\s*}\s*}/g,  // Múltiplas chaves fechadas seguidas
          /{\s*{\s*{/g,  // Múltiplas chaves abertas seguidas
        ];
        
        let hasSuspiciousPattern = false;
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(content)) {
            hasSuspiciousPattern = true;
            break;
          }
        }
        
        // Verifica balanceamento (tolerância de 5 para arquivos minificados)
        const braceDiff = openBraces - closeBraces;
        const parenDiff = openParens - closeParens;
        const absBraceDiff = Math.abs(braceDiff);
        const absParenDiff = Math.abs(parenDiff);
        
        // Reporta problemas mas não tenta corrigir automaticamente
        // (correções automáticas podem piorar o problema se o erro estiver no meio do arquivo)
        if (absBraceDiff > 0 || absParenDiff > 0 || hasSuspiciousPattern) {
          console.warn(`⚠️  Arquivo JavaScript com possível problema: ${src}`);
          console.warn(`   Chaves: ${openBraces} abertas, ${closeBraces} fechadas (diferença: ${braceDiff})`);
          console.warn(`   Parênteses: ${openParens} abertos, ${closeParens} fechados (diferença: ${parenDiff})`);
          console.warn(`   Tamanho do arquivo: ${content.length} caracteres`);
          if (absBraceDiff > 5 || absParenDiff > 5) {
            console.warn(`   ⚠️  ATENÇÃO: Este arquivo pode causar erros de sintaxe no navegador!`);
            console.warn(`   💡 Solução: Reconstrua o projeto do Grupo Raça:`);
            console.warn(`      1. Navegue até a pasta 'gruporaca'`);
            console.warn(`      2. Execute: npm install (se necessário)`);
            console.warn(`      3. Execute: npm run build`);
            console.warn(`      4. Execute novamente: npm run build (no projeto principal)`);
          }
        }
        
        // Copia o arquivo original sem modificações
        // (o arquivo fonte já está corrompido, não adianta tentar corrigir)
        writeFileSync(dest, content, 'utf8');
      } catch (error) {
        console.error(`❌ Erro ao processar arquivo JavaScript ${src}:`, error.message);
        // Tenta copiar mesmo assim como fallback
        try {
          copyFileSync(src, dest);
        } catch (fallbackError) {
          console.error(`❌ Erro ao copiar arquivo ${src}:`, fallbackError.message);
          throw fallbackError;
        }
      }
    } else {
      copyFileSync(src, dest);
    }
  }
}

// Copia também as imagens para a raiz (para compatibilidade com JavaScript que usa caminhos absolutos)
function copyImagesToRoot() {
  const imagesDir = join(targetDir);
  const rootDir = join(process.cwd(), 'public');
  const distRootDir = join(process.cwd(), 'dist');
  
        const imageFiles = [
          'logo.png',
          'logo-todaarte.png',
          'Leilão 01.jpg',
          'Leilão 02.jpg',
          'Leilão 03.jpg',
          'Leilao-08-13-12.jpg',
          'Leilao-09a13-12.jpg',
          'Leilao-11-12-25.jpg',
          'Leilao-15-20-12.jpg',
          'Fundo Cavalo preto.jpg',
          'close-up-no-cavalo-ao-ar-livre.jpg',
          'lindo-cavalo-castanho-close-up-focinho-aparencia-bonita-juba-plano-de-fundo-campo-de-atletismo-curral-arvores-cavalos-sao-animais-maravilhosos.jpg',
          'lindo-cavalo-marrom-ao-ar-livre.jpg',
          'rebanho-de-cavalos-correndo-pela-agua.jpg',
          'foto-ariane.png',
          'foto-ariane-fundo.JPG',
          'logo-ariane-andrade.png',
          'logo-ariane-andrade-fundo.png',
          'arte-ariane-horizontal.png',
          'arte-ariane-vertical.png'
        ];
  
  imageFiles.forEach(img => {
    const srcPath = join(imagesDir, img);
    const destPathPublic = join(rootDir, img);
    const destPathDist = join(distRootDir, img);
    
    if (existsSync(srcPath)) {
      // Copia para public/ (para desenvolvimento)
      copyFileSync(srcPath, destPathPublic);
      // Copia para dist/ (para produção)
      if (existsSync(distRootDir)) {
        copyFileSync(srcPath, destPathDist);
      }
    }
  });
  
  console.log('📸 Imagens do Grupo Raça copiadas para a raiz também');
}

try {
  console.log('📁 Copiando arquivos do Grupo Raça...');
  copyRecursive(sourceDir, targetDir);
  copyImagesToRoot();
  console.log('✅ Arquivos do Grupo Raça copiados com sucesso!');
} catch (error) {
  console.error('❌ Erro ao copiar arquivos do Grupo Raça:', error);
  process.exit(1);
}

