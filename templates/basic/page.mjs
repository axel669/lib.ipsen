import html from "../html.mjs"
import APIInfo from "./api.mjs"

export default ({ mapping, item }) => {
    const api = item.find(ent => ent.ext !== ".md")
    const md = item.find(ent => ent.ext === ".md")

    const content = api.content.map(
        api => html`<${APIInfo} api=${api} />`
    )
    return html`
        <html>
            <head>
                <title>Test?<//>
            <//>
            <body>
                ${content}
            <//>
        <//>
    `
}
