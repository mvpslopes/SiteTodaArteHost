import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Configuração para produção - garantir que os caminhos das imagens funcionem
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Garantir que as imagens sejam copiadas corretamente
    rollupOptions: {
      output: {
        // Manter estrutura de pastas para imagens
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico|webp/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      port: 5173,
    },
  },
  preview: {
    port: 3000,
    host: true,
  },
});
