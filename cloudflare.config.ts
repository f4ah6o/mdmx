import { defineConfig } from 'cf/config'

export default defineConfig({
  worker: {
    name: 'mdmx-app',
    compatibilityDate: '2026-10-01',
    entrypoint: './src/index.ts',
  },
})
