import { defineConfig } from 'vite';

export default defineConfig({
  base: '/gamified-coach-interface/',
  root: '.',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: '/legion-v3.html'
  }
});
