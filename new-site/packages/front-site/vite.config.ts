import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(process.env.ANALYZE === 'true'
      ? [
          visualizer({
            filename: 'dist/stats.json',
            template: 'raw-data',
            gzipSize: true,
            brotliSize: true,
          }),
        ]
      : []),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('/node_modules/@ionic/')) return 'vendor-ionic';
          if (id.includes('/node_modules/ionicons/')) return 'vendor-ionicons';
          if (id.includes('/node_modules/react-router/')) return 'vendor-router';
          if (id.includes('/node_modules/framer-motion/') || id.includes('/node_modules/motion-dom/')) return 'vendor-motion';
          if (id.includes('/node_modules/embla-carousel')) return 'vendor-embla';
          if (id.includes('/node_modules/react-dom/')) return 'vendor-react-dom';
          if (id.includes('/node_modules/react/')) return 'vendor-react';

          return 'vendor-misc';
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: ['semcomp.icmc.usp.br']
  }
})