import { copyFileSync, existsSync } from 'fs';
import { join } from 'path';

const source = join(process.cwd(), 'public', '.htaccess');
const dest = join(process.cwd(), 'dist', '.htaccess');

if (existsSync(source)) {
  try {
    copyFileSync(source, dest);
    console.log('✓ .htaccess copiado para dist/');
  } catch (error) {
    console.error('✗ Erro ao copiar .htaccess:', error.message);
    process.exit(1);
  }
} else {
  console.warn('⚠ Arquivo public/.htaccess não encontrado');
}


