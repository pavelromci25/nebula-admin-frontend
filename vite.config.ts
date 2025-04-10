import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // Устанавливаем base в корень, так как Vercel будет хостить проект по корневому пути
  build: {
    outDir: 'dist', // Указываем папку для сборки
    assetsDir: 'assets' // Указываем папку для ресурсов (по умолчанию 'assets')
  }
});