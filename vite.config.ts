import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // 相對路徑，方便部署到 GitHub Pages 等子路徑環境
  base: './',
  plugins: [react(), tailwindcss()],
});
