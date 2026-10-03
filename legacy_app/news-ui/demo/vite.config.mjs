import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  root: fileURLToPath(new URL('./', import.meta.url)),
  base: '/Sense-AI/',
  plugins: [react()],
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL('../demo-dist', import.meta.url)),
    emptyOutDir: true,
  },
  server: { host: '127.0.0.1', port: 4175 },
  preview: { host: '127.0.0.1', port: 4175 },
});
