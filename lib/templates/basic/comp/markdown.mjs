import { Marked } from "marked"
import APIInfo from "./api.mjs"

import html from "./html.mjs"

const renderAPI = (apis, key) => {
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

    return targets.map(
        api => html`
            <div id="#${api.name}"><//>
            <${APIInfo} ...${{ api, depth }} />
        `
    ).join("\n\n")
}

export default ({ md, apis, item }) => {
    const lastHeader = null
    const parser = new Marked({
        walkTokens(token) {
            if (token.type === "heading") {
                lastHeader = token
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
            token.text = renderAPI(apis, first.href, lastHeader?.depth ?? 1)
        }
    })
    const __html = parser.parse(item.content)

    return html`
        <div dangerouslySetInnerHTML=${{ __html }}><//>
    `
}
