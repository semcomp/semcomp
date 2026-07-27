import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: ['semcomp.icmc.usp.br']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // React core — muda raramente, cache longo
          if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
            return 'vendor-react';
          }
          // Router — separado para não forçar re-download do React core
          if (id.includes('/react-router')) {
            return 'vendor-router';
          }
          // GSAP — lib de animação, versão estável
          if (id.includes('/gsap/')) {
            return 'vendor-gsap';
          }
          // UI helpers leves — lucide, embla, cva, clsx
          if (
            id.includes('/lucide-react/') ||
            id.includes('/embla-carousel') ||
            id.includes('/clsx/') ||
            id.includes('/class-variance-authority/') ||
            id.includes('/tailwind-merge/')
          ) {
            return 'vendor-ui';
          }
          // Restante de node_modules (axios, radix, etc.)
          return 'vendor-misc';
        },
      },
    },
  },
})
