import { Marked } from "marked"

import html from "./comp/html.mjs"
// import Markdown from "./markdown.mjs"
import Sidebar from "./comp/sidebar.mjs"
import APIInfo from "./comp/api.mjs"

import styleFix from "./comp/style-fix.mjs"

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

export default ({ config, apis, md, item }) => {
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
            }
        }
    })
    const __html = parser.parse(item.content)

    return html`
        <html>
            <head>
                <title>Test?<//>
                <meta name="viewport" content="initial-scale=1,maximum-scale=1,minimum-scale=1,width=device-width" />
            <//>
            <body ws-x="@app theme[dark]">
                <script src="https://cdn.jsdelivr.net/npm/@axel669/windstorm@0.1.17/dist/browser.js"></script>
                <style dangerouslySetInnerHTML=${styleFix}></style>
                <script src="./blep.mjs" type="module"></script>
                <ws-screen ws-x="&screen-width[100%]">
                    <ws-paper ws-x="r[0px]">
                        <div ws-x="pos[fixed] x[0px] y[0px] grid w[28px] h[32px]">
                            <label ws-x="@button @flat $compact $color[primary] r[0px]
                            bg[&background]" for="menu" slot="menu">
                                <ws-icon class="ti-menu-2" ws-x="t-sz[20px]" />
                            <//>
                        <//>
                        <ws-flex ws-x="over[auto] p-x[32px] p-y[0px]" id="wrapper">
                            <${Sidebar} ...${{ apis, md, item, headers }} />
                            <div ws-x="w[min(100%,800px)]"
                            dangerouslySetInnerHTML=${{ __html }}><//>
                        <//>
                    <//>
                <//>
            <//>
        <//>
    `
}
