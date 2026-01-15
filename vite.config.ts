import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // We empty outDir manually in scripts to handle multiple build steps
    emptyOutDir: false, 
  }
});