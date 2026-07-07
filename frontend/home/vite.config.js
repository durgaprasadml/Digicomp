import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  base: '/wp-content/themes/dc/frontend/home/dist/',
  build: {
    manifest: '_manifest.json',
    outDir: 'dist',
    rollupOptions: {
      input: 'src/main.jsx',
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})
