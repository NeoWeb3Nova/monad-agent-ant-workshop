import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Vite exposes only VITE_* keys; private Agent keys in the root .env stay server-side.
  envDir: '..',
  plugins: [react(), tailwindcss()],
})
