import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  // dev 模式根路径 `/`，build 时用 `/TEXT2/` 适配 GitHub Pages
  base: command === 'build' ? '/TEXT2/' : '/',
  plugins: [react(), tailwindcss()],
}))
