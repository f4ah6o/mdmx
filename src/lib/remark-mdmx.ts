import { visit } from 'unist-util-visit'

export default function remarkMdmx() {
  return (tree: any) => {
    visit(tree, 'link', (node: any) => {
      const url = node.url.trim()

      // 1. [username]() → Input
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

      // 2. [送信](/api/greet) または [送信](POST /api/greet) → Button/Action
      const httpVerbs = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      const urlParts = url.split(/\s+/)
      const firstPart = urlParts[0]?.toUpperCase()

      let verb = 'POST' // デフォルト
      let path = url

      // HTTP動詞が明示されている場合
      if (httpVerbs.includes(firstPart)) {
        verb = firstPart
        path = urlParts.slice(1).join(' ')
      }
      // /で始まるパス → ボタンとして扱う
      else if (url.startsWith('/')) {
        verb = 'POST'
        path = url
      }
      // http:// や https:// → 通常のリンクとして扱う（変換しない）
      else if (url.startsWith('http://') || url.startsWith('https://')) {
        return
      }
      // その他 → 通常のリンク
      else {
        return
      }

      // ボタンに変換
      const hxProps: Record<string, string> = {
        [`hx-${verb.toLowerCase()}`]: path,
      }

      // titleから属性を解析 (hx-target=#result 形式)
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