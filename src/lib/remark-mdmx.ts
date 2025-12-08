import { visit } from 'unist-util-visit'

export default function remarkMdmx() {
  return (tree: any) => {
    visit(tree, 'link', (node: any) => {
      const httpVerbs = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
      const urlParts = node.url.trim().split(/\s+/)
      const verb = urlParts[0]?.toUpperCase()

      // 1. [送信する](POST /api/greet) → Button/Action
      if (httpVerbs.includes(verb)) {
        const path = urlParts.slice(1).join(' ')

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
      }
      // 2. [username]() → Input
      else if (node.url === '' || node.url === '#') {
        const name = node.children?.[0]?.value || 'input'

        node.data = node.data || {}
        node.data.hName = 'input'
        node.data.hProperties = {
          name: name,
          type: 'text',
          placeholder: node.title || name,
        }
      }
    })
  }
}