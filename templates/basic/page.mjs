import html from "../html.mjs"
import APIInfo from "./api.mjs"

export default ({ api, md }) => {
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
