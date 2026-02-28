import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        client: resolve(__dirname, 'client.html'),
        evolved: resolve(__dirname, 'legion-command-center-evolved.html'),
        v3: resolve(__dirname, 'legion-v3.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: '/legion-v3.html'
  }
});
