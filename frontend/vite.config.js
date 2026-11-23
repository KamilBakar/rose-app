import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    proxy: {
      '/api': { target: loadEnv(mode, '.', 'ROSE_').ROSE_API_TARGET || 'http://localhost:8000' },
    },
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
}))
