import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';

/**
 * MDMX Core Plugin
 * MarkdownのASTを巡回し、特定の記法をHTMX要素に変換する
 */
function remarkMdmx() {
  return (tree) => {
    // 1. Link -> Button/Action 変換
    visit(tree, 'link', (node) => {
      // urlが @verb: で始まるかチェック (例: @post:/api/save)
      if (node.url.startsWith('@')) {
        const [verbInfo, ...urlParts] = node.url.split(':');
        const verb = verbInfo.replace('@', ''); // post, get, delete...
        const path = urlParts.join(':');

        // HTMX用のプロパティを構築
        const hxProps = {
          [`hx-${verb}`]: path,
        };

        // title属性があれば、それをパースして追加属性にする
        // 例: [Save](@post:/save "hx-target=#list class=btn")
        if (node.title) {
           // 簡易的な属性パース (本番ではもっと堅牢なパーサー推奨)
           const attrs = node.title.split(' ');
           attrs.forEach(attr => {
             const [key, val] = attr.split('=');
             if(key && val) hxProps[key] = val;
             else if(key) hxProps['class'] = key; // 値なしはクラス扱いなど
           });
        }

        // ノードをHTML要素(h要素)としての情報で上書き
        node.data = node.data || {};
        node.data.hName = 'button'; // <a> ではなく <button> に変換
        node.data.hProperties = {
          ...node.data.hProperties,
          ...hxProps
        };
      }
    });

    // 2. Image -> Input 変換
    visit(tree, 'image', (node) => {
        // srcが @input:name で始まるかチェック
        if (node.url.startsWith('@input')) {
            const [_, name] = node.url.split(':');
            
            node.data = node.data || {};
            node.data.hName = 'input';
            node.data.hProperties = {
                name: name || 'input',
                placeholder: node.alt, // 画像のalt属性をプレースホルダーに
                type: 'text',
                // title属性があれば追加属性へ
                ...(node.title ? { 'hx-trigger': node.title } : {})
            };
        }
    });
  };
}

// --- 実行テスト ---

const mdmxSource = `
# MDMX Demo

データの登録フォームです。

![ユーザー名を入力...](@input:username "keyup changed delay:500ms")

[保存する](@post:/api/save "hx-target=#result hx-swap=outerHTML")

<div id="result"></div>
`;

async function compile(source) {
  const file = await unified()
    .use(remarkParse)      // Markdown -> MDAST
    .use(remarkMdmx)       // ★ MDMX変換処理
    .use(remarkRehype, {allowDangerousHtml: true})     // MDAST -> HAST
    .use(rehypeStringify, {allowDangerousHtml: true})  // HAST -> HTML
    .process(source);

  return String(file);
}

console.log("--- Input (MDMX) ---");
console.log(mdmxSource);
console.log("\n--- Output (HTML) ---");
compile(mdmxSource).then(console.log);