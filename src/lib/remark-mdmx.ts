import { visit } from 'unist-util-visit'

export default function remarkMdmx() {
  return (tree: any) => {
    // 1. Link -> Button/Action
    visit(tree, 'link', (node: any) => {
      if (node.url.startsWith('@')) {
        const [verbInfo, ...urlParts] = node.url.split(':')
        const verb = verbInfo.replace('@', '') // post, get...
        const path = urlParts.join(':')

        const hxProps: Record<string, string> = {
          [`hx-${verb}`]: path,
        }

        if (node.title) {
          const attrs = node.title.split(' ')
          attrs.forEach((attr: string) => {
            const [key, val] = attr.split('=')
            if (key) hxProps[key] = val || ""
          })
        }

        node.data = node.data || {}
        node.data.hName = 'button'
        node.data.hProperties = { ...node.data.hProperties, ...hxProps }
      }
    })

    // 2. Image -> Input
    visit(tree, 'image', (node: any) => {
      if (node.url.startsWith('@input')) {
        const [_, name] = node.url.split(':')
        node.data = node.data || {}
        node.data.hName = 'input'
        node.data.hProperties = {
          name: name || 'input',
          placeholder: node.alt,
          type: 'text',
          ...(node.title ? { 'hx-trigger': node.title } : {})
        }
      }
    })
  }
}