import { defineConfig } from 'vite'
import devServer from '@hono/vite-dev-server'
// ↓ 修正箇所: cloudflare-pages ではなく cloudflare を読み込みます
import adapter from '@hono/vite-dev-server/cloudflare'
import build from '@hono/vite-build'

export default defineConfig({
  plugins: [
    devServer({
      entry: 'src/index.ts',
      adapter, // 修正したアダプターを使用
    }),
    build({
      entry: 'src/index.ts',
      target: 'cloudflare-workers',
      minify: true,
    }),
  ],
})