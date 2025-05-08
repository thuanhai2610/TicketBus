import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    port: 3000,  // Port cho frontend
  },
  resolve: {
    alias: {
      // eslint-disable-next-line no-undef
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist/public', // Đảm bảo Vite build vào thư mục 'dist/public' để NestJS phục vụ
  },
  optimizeDeps: {
    include: ['qrcode.react'],
  },
})
