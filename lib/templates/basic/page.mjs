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
            <//>
            <body ws-x="@app theme[dark]">
                <script src="https://cdn.jsdelivr.net/npm/@axel669/windstorm@0.1.17/dist/browser.js"></script>
                <style dangerouslySetInnerHTML=${styleFix}></style>
                <script src="./blep.mjs" type="module"></script>
                <ws-screen ws-x="&screen-width[100%]">
                    <ws-paper ws-x="r[0px]">
                        <ws-titlebar ws-x="@fill $color[primary]" slot="header">
                            <ws-text ws-x="$title" slot="title">
                                Test?
                            <//>

                            <label ws-x="@button @flat $compact" for="menu" slot="menu">
                                <ws-icon class="ti-menu-2" />
                            <//>
                        <//>
                        <ws-flex ws-x="over[auto]" id="wrapper">
                            <${Sidebar} ...${{ apis, md, item, headers }} />
                            <div ws-x="w[min(100%,720px)] p[4px]"
                            dangerouslySetInnerHTML=${{ __html }}><//>
                        <//>
                    <//>
                <//>
            <//>
        <//>
    `
}
