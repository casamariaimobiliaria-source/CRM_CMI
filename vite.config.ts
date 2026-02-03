
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'ImobLeads CRM',
        short_name: 'ImobLeads',
        description: 'CRM Profissional para Corretores de Imóveis',
        theme_color: '#0f172a',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react', 'sonner'],
          'vendor-charts': ['recharts'],
          'vendor-utils': ['date-fns', 'zod', 'clsx', 'tailwind-merge']
        }
      }
    }
  }
});
