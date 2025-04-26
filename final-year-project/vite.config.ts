/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/', 
  plugins: [
    react(),
    legacy()
  ],
  server: {
    open: true,
    strictPort: true,
    fs: {
      strict: false 
    }
  },
  publicDir: "public",
  build: {
    outDir: "dist",
  }
});
