import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), tailwindcss(), svgr()],
  base: '/wp-content/themes/dc/frontend/home/dist/',
  build: {
    modulePreload: {
      resolveDependencies: (filename, deps) => {
        return deps.filter(dep => !dep.includes('model-viewer'));
      }
    },
    manifest: '_manifest.json',
    outDir: 'dist',
    rollupOptions: {
      input: 'src/main.jsx'
    }
  }
})
