import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // In an SSR build the dependencies stay external, so they cannot be
      // assigned to chunks — this splitting applies to the browser build only.
      output: isSsrBuild
        ? {}
        : {
            // Split the heavy, rarely-changing libraries out of the app bundle so
            // a content change does not force visitors to re-download them.
            manualChunks: {
              react: ['react', 'react-dom', 'react-router-dom'],
              motion: ['framer-motion'],
              icons: ['lucide-react'],
            },
          },
    },
  },
}))
