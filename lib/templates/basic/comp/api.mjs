import html from "./html.mjs"

const Type = ({ info }) => {
    if (typeof info === "string") {
        return html`<div>${info}<//>`
    }
    return html`
        <div>
            ${info.type}
            <span style="font-style: italic;">${info.tags.join(", ")}<//>
        <//>
    `
}
const APIInfo = ({ api, depth }) => {
    const { name, type, props, desc } = api
    const heading = `h${depth}`
    return html`
        <div>
            <${heading}>${name}<//>
            <${Type} info=${type} />
            <div>${desc}</div>
            ${props?.map(
                api => html`<${APIInfo} api=${api} />`
            )}
        <//>
    `
}

export default APIInfo
