import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    // One site-wide stylesheet (~15 kB gzip): a single cached, render-blocking
    // request instead of many small per-chunk files.
    cssCodeSplit: false,
    sourcemap: false,
    manifest: true,
    // The SSR build is only used at build time to prerender static HTML.
    emptyOutDir: true,
  },
  ssr: {
    // Bundle everything so the prerender step has no runtime resolution surprises.
    noExternal: true,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
