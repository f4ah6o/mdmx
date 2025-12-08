# mdmx

**Markdownのスーパーセット**としてインタラクティブなWebアプリケーションを記述できるフレームワーク。
htmxと組み合わせて、より簡潔で自然な書き味を実現します。

## 特徴

- **Markdownのスーパーセット**: 標準Markdownをそのまま拡張
- **簡潔な記法**: HTTP動詞は省略可能（デフォルトPOST）
- **直感的**: `[送信](/api/greet)` でボタン、`[username]()` でインプット
- **通常のリンクも使える**: `https://` で始まるURLは通常のリンクとして機能

## 記法例

```markdown
# サンプルフォーム

名前: [username]("お名前を入力してください")

[サーバーに送信](/api/greet "hx-target=#response hx-include=[name='username']")

<div id="response">
  結果がここに表示されます
</div>
```

### 記法の説明

1. **インプット欄**: `[フィールド名]()`
   - 例: `[username]()` → `<input name="username" type="text" />`
   - プレースホルダー: `[username]("名前を入力")`

2. **ボタン/アクション**: `[テキスト](パス)` または `[テキスト](HTTP動詞 パス)`
   - 簡潔: `[送信](/api/greet)` → `<button hx-post="/api/greet">送信</button>`
   - 明示: `[取得](GET /api/data)` → `<button hx-get="/api/data">取得</button>`
   - `/`で始まるパスはデフォルトでPOST、必要な時だけHTTP動詞を指定

3. **通常のリンク**: `https://` で始まるURLは通常のリンクとして機能
   - 例: `[GitHub](https://github.com)` → 通常のリンク

4. **HTMX属性**: タイトルフィールドで指定
   - 例: `[送信](/api "hx-target=#result hx-swap=outerHTML")`

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
