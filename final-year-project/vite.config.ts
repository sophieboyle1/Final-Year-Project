/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  server: {
    open: true,
    strictPort: true,
    fs: {
      strict: false // Allow serving files from outside the root
    }
  },
  publicDir: "public" // ✅ Explicitly define the public directory
})
