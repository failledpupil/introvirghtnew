import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor';
            }
            if (id.includes('@tiptap')) {
              return 'editor';
            }
            if (id.includes('zustand') || id.includes('clsx') || id.includes('tailwind-merge')) {
              return 'ui';
            }
            if (id.includes('openai')) {
              return 'optional';
            }
          }
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    allowedHosts: [
      'motion-enhance.preview.emergentagent.com',
      '.emergentagent.com',
      'localhost'
    ],
    hmr: {
      host: 'localhost',
      clientPort: 443,
      protocol: 'wss'
    }
  }
})
