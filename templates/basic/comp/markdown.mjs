import { marked, Marked } from "marked"
import APIInfo from "./api.mjs"

import html from "./html.mjs"

export default ({ md, api }) => {
    if (md === null || md === undefined) {
        return null
    }
    const used = []
    const apis = api.content.reduce(
        (apis, entry) => {
            apis[entry.name] = html`<${APIInfo} api=${entry} />`
            return apis
        },
        {}
    )
    const parser = new Marked({
        walkTokens(token) {
            if (token.type !== "paragraph") {
                return
            }
            const [first] = token.tokens
            if (first.type !== "link" || first.text !== "@@api") {
                return
            }

            token.type = "html"
            if (token.href === "") {
                token.text = Object.values(apis).join("\n")
                used.push(...Object.keys(apis))
                return
            }

            const name = first.href
            token.text = apis[name]
            used.push(name)
        }
    })
    const coreHTML = parser.parse(md.content)
    const unusedAPIs =
        Object.entries(apis)
        .filter(
            ([ name ]) => used.indexOf(name) === -1
        )
        .map(
            ([, html]) => html
        )
        .join("\n")

    const __html = `${coreHTML}\n${unusedAPIs}`
    return html`
        <div dangerouslySetInnerHTML=${{ __html }}><//>
    `
}
