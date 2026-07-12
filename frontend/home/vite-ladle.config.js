import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [tailwindcss(), svgr()],
  // Exclude the project's @vitejs/plugin-react as Ladle provides its own internal React plugin natively.
});
