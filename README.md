# mdmx

## setup

```bash
# ディレクトリ作成
mkdir mdmx-app
cd mdmx-app

# package.json の作成
pnpm init

# 必要なライブラリのインストール
pnpm add hono unified remark-parse remark-rehype rehype-stringify unist-util-visit

# 開発用ライブラリ（Typescript, Wrangler, Viteなど）
pnpm add -D wrangler typescript @cloudflare/workers-types vite @hono/vite-build @hono/vite-dev-server
```
