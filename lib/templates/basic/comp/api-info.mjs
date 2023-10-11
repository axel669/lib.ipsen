import { marked } from "marked"

import html from "./html.mjs"

const tagText = (tags, tag, text) => tags.includes(tag) ? text : ""
const MD = ({ md, wrapper = "div" }) => html`
    <${wrapper} dangerouslySetInnerHTML=${{
        __html: marked.parse(md)
    }}><//>
`
const subtypes = {
    number: ({info}) => html`
        <code>number<//>
        <${MD} md=${info.desc} />
    `,
    fn: ({info}) => {
        const a = tagText(info.type.tags, "async", "async")
        const g = tagText(info.type.tags, "gen", "*")
        const name = `${a} ${info.name}${g}`.trim()
        const argList = info.args.map(
            arg => (arg.optional === true) ? `[${arg.name}]` : arg.name
        )
        return html`
            <code>
                ${name}(${argList.join(", ")})
            <//>
            <${MD} md=${info.desc} />
            <${Args} args=${info.args} />
        `
    }
}

const Args = ({ args }) => {
    if (args.length === 0) {
        return null
    }
    return html`
        <div style="font-weight: bold;">Arguments<//>
        <${TypeDisplay} props=${args} />
    `
}
const TypeDisplay = ({ props }) => {
    if (typeof props === "string") {
        return html`<div>${props}</div>`
    }
    return html`
        <ws-flex ws-x="p[0px] gap[8px]">
            <${Props} props=${props} depth=${0} />
        <//>
    `
}
const If = ({ when, children }) => {
    if (when === true) {
        return children
    }
    return null
}
const Props = ({ props }) => props.map(
    prop => html`
        <ws-flex ws-x="p[0px] p-l[12px] b-l[2px_solid_var(--primary)] gap[8px]">
            <ws-titlebar ws-x="">
                <ws-text ws-x="$title">
                    ${prop.name}
                    <ws-text ws-x="$subtitle">
                        ${prop.type}
                    <//>
                <//>
            <//>
            <${MD} md=${prop.desc} />
            <${If} when=${prop.props.length > 0}>
                <div style="font-weight: bold;">Properties<//>
                <${Props} props=${prop.props} />
            <//>
        <//>
    `
)
const APIInfo = ({ api, depth }) => {
    const heading = `h${depth}`
    const component = subtypes[api.type.type ?? api.type]
    return html`
        <${heading}>${api.name}<//>
        <${component} info=${api} />
    `
}

export default APIInfo
