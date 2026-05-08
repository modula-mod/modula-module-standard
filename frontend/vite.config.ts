import path from 'node:path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    lib: {
      entry: path.resolve(__dirname, 'src/modula-entry.ts'),
      name: 'ModulaExampleModule',
      formats: ['es'],
      fileName: () => 'modula-entry.js'
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name ?? '';
          if (name.endsWith('.css')) {
            return 'modula-entry.css';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});
