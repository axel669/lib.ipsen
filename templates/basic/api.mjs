import html from "../html.mjs"

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
const APIInfo = ({ api }) => {
    const { name, type, props, desc } = api
    return html`
        <div style="border: 1px solid black; padding: 4px;">
            <div style="">${name}</div>
            <${Type} info=${type} />
            <div>${desc}</div>
            ${props?.map(
                api => html`<${APIInfo} api=${api} />`
            )}
        <//>
    `
}

export default APIInfo
