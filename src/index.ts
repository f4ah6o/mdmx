import { Hono } from 'hono'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeStringify from 'rehype-stringify'
import remarkMdmx from './lib/remark-mdmx'

// ★ ポイント: 末尾に ?raw をつけて文字列としてインポート
import helloPageMdmx from './pages/hello.mdmx?raw'

const app = new Hono()

// コンパイル関数の共通化
async function compileMdmx(source: string) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkMdmx) // 切り出したプラグインを使用
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(source)
  
  return String(file)
}

// ページ表示ルート
app.get('/', async (c) => {
  // ファイルから読み込んだMarkdownをコンパイル
  const content = await compileMdmx(helloPageMdmx)
  
  // HTMLのガワ
  return c.html(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>MDMX File Loading</title>
        <script src="https://unpkg.com/htmx.org@1.9.10"></script>
        <style>
          body { font-family: sans-serif; max-width: 600px; margin: 2rem auto; padding: 1rem; }
          input { padding: 8px; margin-right: 8px; }
          button { padding: 8px 16px; cursor: pointer; background: #0070f3; color: white; border: none; border-radius: 4px; }
          #response { margin-top: 1rem; padding: 1rem; background: #f4f4f4; border-radius: 4px; }
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `)
})

// APIルート (HTMXからのリクエストを受け取る)
app.post('/api/greet', async (c) => {
  const body = await c.req.parseBody()
  const name = body['username'] || 'ゲスト'
  
  return c.html(`
    <p style="color: green;">
      サーバー完了: <strong>${name}</strong> さん、こんにちは！<br>
      ファイル分割に成功しました 🎉
    </p>
  `)
})

export default app