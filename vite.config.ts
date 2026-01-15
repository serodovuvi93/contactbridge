import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/contactbridge/',
  build: {
    // Prevent emptying output dir between steps
    emptyOutDir: false,
  },
  ssr: {
    // Ensure these are bundled for the node renderer
    noExternal: ['react-router-dom', 'lucide-react', 'react-qr-code']
  }
});