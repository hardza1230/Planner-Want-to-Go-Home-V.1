import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 'base: ./' is CRITICAL for Electron. 
  // It ensures assets are loaded from './assets/...' instead of '/assets/...'
  // which enables the app to run from the file system (file:// protocol).
  base: './', 
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});