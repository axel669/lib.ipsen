import { Marked } from "marked"
import { render } from "preact-render-to-string"

import html from "./comp/html.mjs"
import APIInfo from "./comp/api-info.mjs"

const renderAPI = (apis, key, headers) => {
    console.log("render apis:", key)
    const [file, list] = key.split("|")
    const keys = list?.split(",") ?? []

    const source = apis[file]
    const targets =
        (keys.length === 0)
            ? source.meta.__content
            : keys.map(
                key => source.meta.__content.find(
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

    return render(
        targets.map(
            api => html`
                <div id="h${api.id}"><//>
                <${APIInfo} ...${{ api, depth }} />
            `
        )
    )
}

let headers = null
let apiRef = null
const md = new Marked({
    gfm: true,
    walkTokens(token) {
        if (token.raw.includes("py-stuff")) {
            console.log(token)
        }
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
        token.text = renderAPI(apiRef, first.href, headers)
    },
    renderer: {
        heading(text, [depth, id]) {
            const name = `h${depth}`
            return render(html`<${name} id="h${id}">${text}<//>`)
        },
        code(code, language) {
            if (language === "mermaid") {
                return `<pre class="mermaid">${code}</pre>`
            }
            return false
        }
    }
})

export default (markdown, api) => {
    headers = []
    apiRef = api
    const html = md.parse(markdown)
    return [html, [...headers]]
}
