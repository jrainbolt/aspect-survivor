import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/aspect-survivor/' : './',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
