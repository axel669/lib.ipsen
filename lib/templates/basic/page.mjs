import { Marked } from "marked"

import html from "./comp/html.mjs"
// import Markdown from "./markdown.mjs"
import Sidebar from "./comp/sidebar.mjs"
import APIInfo from "./comp/api.mjs"

import styleFix from "./comp/style-fix.mjs"

const themeCSS = {
    light: "-coy",
    dark: "-twilight",
    tron: "-twilight",
}

const renderAPI = (apis, key, headers) => {
    console.log("render apis:", key)
    const [file, list] = key.split("|")
    const keys = list?.split(",") ?? []

    const source = apis[file]
    const targets =
        (keys.length === 0)
            ? source.content
            : keys.map(
                key => source.content.find(
                    item => item.name === key
                )
            )

    const depth = headers.findLast(h => h.type === "heading").depth + 1
    for (const item of targets) {
        headers.push({
            text: item.name,
            depth: depth,
        })
        item.id = headers.length
    }

    return targets.map(
        api => html`
            <div id="h${api.id}"><//>
            <${APIInfo} ...${{ api, depth }} />
        `.join("\n")
    ).join("\n\n")
}

var escMap = {
    "&": "amp",
    "<": "lt",
    ">": "gt",
    "\"": "quot",
    "'": "apos",
};
export default ({ config, apis, md, item }) => {
    const { options = {} } = config
    const theme = options.theme ?? "dark"

    const headers = []
    const parser = new Marked({
        walkTokens(token) {
            if (token.type === "heading") {
                headers.push({ ...token })
                token.depth = [token.depth, headers.length]
                return
            }

            if (token.type !== "paragraph") {
                return
            }
            const [first] = token.tokens
            if (first.type !== "link" || first.text !== "@@api") {
                return
            }

            token.type = "html"
            token.text = renderAPI(apis, first.href, headers)
        },
        renderer: {
            heading(text, [depth, id], raw) {
                const name = `h${depth}`
                return html`<${name} id="h${id}">${text}<//>`
            },
            code(code, language) {
                if (language === "mermaid") {
                    return `<pre class="mermaid">${code}</pre>`
                }
                // vhtml doesn't escape properly within code tags apparently,
                // so I have to do a manual escaping and create the raw HTML
                // in order to avoid weird bugs introduced by vhtml's incorrect
                // handling of it.
                const escaped = code.replace(/[&<>"']/g, s => `&${escMap[s]};`)
                return `<pre><code class="language-${language}">${escaped}</code></pre>`
            }
        }
    })
    const __html = parser.parse(item.content)

    return html`
        <html>
            <head>
                <title>Test?<//>
                <meta name="viewport" content="initial-scale=1,maximum-scale=1,minimum-scale=1,width=device-width" />

                <link href="https://cdn.jsdelivr.net/npm/prismjs@v1.29.0/themes/prism${themeCSS[theme]}.css" rel="stylesheet" />
            <//>
            <body ws-x="theme[${theme}]">
                <script src="https://cdn.jsdelivr.net/npm/@axel669/windstorm@0.1.17/dist/browser.js"></script>
                <style dangerouslySetInnerHTML=${styleFix}></style>
                <ws-paper ws-x="r[0px] w[min(100%,800px)] m-l[auto] m-r[auto]">
                    <div ws-x="pos[fixed] x[0px] y[0px] grid w[36px] h[40px]">
                        <label ws-x="@button @flat $compact $color[primary] r[0px]
                        bg[&background-layer] b-s[solid] b-c[&primary]
                        b-r-w[2px] b-b-w[2px] r-br[4px]" for="menu" slot="menu">
                            <ws-icon class="ti-menu-2" ws-x="t-sz[20px]" />
                        <//>
                    <//>
                    <ws-flex ws-x="over[auto] p-x[40px] p-y[0px]" id="wrapper">
                        <${Sidebar} ...${{ apis, md, item, headers }} />
                        <div dangerouslySetInnerHTML=${{ __html }}><//>
                    <//>
                <//>
                <script src="https://cdn.jsdelivr.net/npm/prismjs@v1.29.0/components/prism-core.min.js"></script>
	            <script src="https://cdn.jsdelivr.net/npm/prismjs@v1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
                <script type="module" dangerouslySetInnerHTML=${{
                    __html: `
                        import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";
                        mermaid.initialize({ startOnLoad: true });
                    `
                }}></script>
            <//>
        <//>
    `
}
