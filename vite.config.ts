import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: mode === 'singlefile' ? [react(), viteSingleFile()] : [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: mode === 'singlefile'
    ? {
        outDir: 'dist-single',
        assetsInlineLimit: 100_000_000,
        cssCodeSplit: false,
      }
    : {},
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
}))
