# mdmx 仕様書

mdmxは**Markdownのスーパーセット**として設計されたマークアップ言語です。
標準Markdownの文法を完全に保持しながら、インタラクティブなWeb要素を表現する記法を追加しています。

## 設計思想

1. **Markdownのスーパーセット**: 標準Markdown文書はそのまま有効
2. **簡潔さ**: 冗長な記述を避け、最小限の記法で最大の表現力
3. **直感性**: Markdownの自然な拡張として理解できる記法
4. **後方互換性**: 通常のMarkdownとして読んでも意味が通じる

## 基本仕様

### 1. インプット欄

空のリンク記法 `[text]()` をインプット要素として扱います。

**構文:**
```markdown
[フィールド名]()
[フィールド名]("プレースホルダーテキスト")
```

**変換:**
```markdown
[username]()
→ <input name="username" type="text" placeholder="username" />

[username]("お名前を入力してください")
→ <input name="username" type="text" placeholder="お名前を入力してください" />
```

**設計理由:**
- リンク先が空 (`()`) の場合、通常のMarkdownでは無意味
- この無意味な記法を再利用することで、新しい構文を追加せずに拡張
- テキストがフィールド名、タイトルがプレースホルダーという自然な対応

### 2. アクションボタン

パス（`/`で始まるURL）へのリンクをボタンとして扱います。

**構文:**
```markdown
[ボタンテキスト](パス)
[ボタンテキスト](HTTP動詞 パス)
[ボタンテキスト](パス "属性リスト")
```

**変換:**
```markdown
[送信](/api/greet)
→ <button hx-post="/api/greet">送信</button>

[取得](GET /api/data)
→ <button hx-get="/api/data">取得</button>

[送信](/api/greet "hx-target=#result hx-swap=innerHTML")
→ <button hx-post="/api/greet" hx-target="#result" hx-swap="innerHTML">送信</button>
```

**HTTP動詞:**
- `GET`, `POST`, `PUT`, `DELETE`, `PATCH` をサポート
- 省略時のデフォルトは `POST`
- 動詞は大文字・小文字を区別しない（内部で正規化）

**設計理由:**
- `/api/...` のような相対パスは、通常のMarkdownでは推奨されない
- この特殊なケースをインタラクティブ要素として解釈
- HTTP動詞を省略可能にすることで、簡潔な記法を実現

### 3. 通常のリンク

`http://` または `https://` で始まるURLは、標準Markdownのリンクとして扱います。

**構文:**
```markdown
[テキスト](https://example.com)
[テキスト](相対パス.html)
```

**変換:**
```markdown
[GitHub](https://github.com)
→ <a href="https://github.com">GitHub</a>

[about](./about.html)
→ <a href="./about.html">about</a>
```

**設計理由:**
- 標準Markdownとの完全な互換性を保証
- 絶対URLと相対HTMLパスは通常のリンクとして機能
- `/api/...` のようなAPIパスのみをボタンとして扱う明確な区別

### 4. HTMX属性の指定

リンクのタイトルフィールド（ダブルクォート内）で、HTMX属性を指定できます。

**構文:**
```markdown
[ボタン](パス "key=value key2=value2")
```

**変換:**
```markdown
[送信](/api/greet "hx-target=#response hx-include=[name='username']")
→ <button hx-post="/api/greet" hx-target="#response" hx-include="[name='username']">送信</button>
```

**属性の形式:**
- スペース区切りで複数の属性を指定
- `key=value` の形式
- 値が無い場合は空文字列として扱う

**設計理由:**
- Markdownの標準的なタイトルフィールドを活用
- 追加の構文を導入せずに拡張性を確保

## 変換ルール

mdmxパーサーは、remarkプラグインとして実装され、以下の順序で処理します:

1. **Markdown構文解析**: remark-parseで標準Markdownとしてパース
2. **AST変換**: linkノードを検査し、条件に応じて変換
3. **HTML生成**: 変換されたASTをHTMLに出力

### 変換の優先順位

1. 空リンク `[text]()` → input要素
2. APIパス `/...` → button要素（htmx）
3. 絶対URL `https://...` → 通常のa要素
4. その他 → 通常のa要素

## 実装例

### remarkプラグイン

```typescript
import { visit } from 'unist-util-visit'

export default function remarkMdmx() {
  return (tree: any) => {
    visit(tree, 'link', (node: any) => {
      const url = node.url.trim()

      // 1. 空リンク → input
      if (url === '' || url === '#') {
        const name = node.children?.[0]?.value || 'input'
        node.data = node.data || {}
        node.data.hName = 'input'
        node.data.hProperties = {
          name: name,
          type: 'text',
          placeholder: node.title || name,
        }
        return
      }

      // 2. APIパス → button
      const httpVerbs = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      const urlParts = url.split(/\s+/)
      const firstPart = urlParts[0]?.toUpperCase()

      let verb = 'POST'
      let path = url

      if (httpVerbs.includes(firstPart)) {
        verb = firstPart
        path = urlParts.slice(1).join(' ')
      } else if (url.startsWith('/')) {
        verb = 'POST'
        path = url
      } else if (url.startsWith('http://') || url.startsWith('https://')) {
        return // 通常のリンク
      } else {
        return // 通常のリンク
      }

      // button要素に変換
      const hxProps: Record<string, string> = {
        [`hx-${verb.toLowerCase()}`]: path,
      }

      if (node.title) {
        const attrs = node.title.split(/\s+/)
        attrs.forEach((attr: string) => {
          const [key, val] = attr.split('=')
          if (key) hxProps[key] = val || ""
        })
      }

      node.data = node.data || {}
      node.data.hName = 'button'
      node.data.hProperties = { ...node.data.hProperties, ...hxProps }
    })
  }
}
```

## 完全な例

```markdown
# ユーザー登録フォーム

## 入力欄

名前: [username]("ユーザー名を入力")
メール: [email]("メールアドレス")
パスワード: [password]("8文字以上")

## アクション

[登録](/api/register "hx-target=#result hx-include=[name='username'],[name='email'],[name='password']")

[キャンセル](/)

## 結果表示

<div id="result">
  ここに結果が表示されます
</div>

## 参考リンク

詳しくは[利用規約](https://example.com/terms)をご覧ください。
```

## 今後の拡張

将来的に検討される機能:

- **select要素のサポート**: `[select:option1,option2,option3]()`
- **textarea要素のサポート**: `[textarea]()`
- **カスタム属性の簡潔な記法**: `[username](){required}`
- **イベントハンドラの記法**: リアルタイムバリデーション等

ただし、いずれの拡張も「Markdownのスーパーセット」という設計思想を維持し、
既存のMarkdown文書との互換性を損なわないことを原則とします。

## バージョン

- **仕様バージョン**: 1.0.0
- **最終更新**: 2025-12-08
