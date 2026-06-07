import { defineConfig } from 'vite';

const isPagesBuild = process.env.GITHUB_ACTIONS === 'true' || process.env.PAGES_BUILD === 'true';

export default defineConfig({
  base: isPagesBuild ? '/aspect-survivor/' : './',
  build: {
    outDir: 'dist',
    sourcemap: !isPagesBuild,
  },
});
