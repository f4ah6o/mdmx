# mdmx

Markdownライクな記法でインタラクティブなWebアプリケーションを作成できるフレームワーク。
htmxと組み合わせて、よりMarkdownらしい自然な書き味を実現します。

## 特徴

- **Markdownらしい記法**: 特殊な記号を使わず、標準的なMarkdownの延長線上の記法
- **リンク記法でアクション**: `[送信](POST /api/greet)` のような直感的な記法
- **インプット記法**: `[username]()` でフォーム入力欄を表現
- **htmxサポート**: HTMX属性を自然に記述可能

## 記法例

```markdown
# サンプルフォーム

名前: [username]("お名前を入力してください")

[サーバーに送信](POST /api/greet "hx-target=#response hx-include=[name='username']")

<div id="response">
  結果がここに表示されます
</div>
```

### 記法の説明

1. **インプット欄**: `[フィールド名]()`
   - 例: `[username]()` → `<input name="username" type="text" />`
   - プレースホルダー指定: `[username]("名前を入力")`

2. **ボタン/アクション**: `[テキスト](HTTP動詞 パス)`
   - 例: `[送信](POST /api/greet)` → `<button hx-post="/api/greet">送信</button>`
   - サポートする動詞: GET, POST, PUT, DELETE, PATCH

3. **HTMX属性**: タイトルフィールドで指定
   - 例: `[送信](POST /api "hx-target=#result")`

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
