import html from "./html.mjs"

const Link = ({ href, text }) => html`
    <a href="${href}"
    ws-x="block t-deco[none] hover:c[&secondary]
    hover:b-r[3px_solid_var(--secondary)]">
        <ws-icon class="ti-file-text"><//>
        ${text}
    <//>
`
const Tree = ({ nodes }) => nodes.map(
    node =>
        (node.children.length === 0)
        ? Link({ href: `${node.path.join("/")}.html`, text: node.name })
        : html`
            <div>
                <ws-icon class="ti-folder" /> ${node.name}
                <ws-flex ws-x="p-l[16px] p-r[0px]">
                    <${Tree} nodes=${node.children} />
                <//>
            <//>
        `
)

export default ({ headers, contentTree }) => {
    const files = contentTree
    return html`
        <input type="checkbox" ws-x="hide" id="menu" />
        <ws-modal ws-x="&anim-time[200ms]">
            <label for="menu"><//>
            <ws-paper ws-x="@menu r[0px] w[] w-min[20vw] w-max[320px]">
                <ws-flex ws-x="over-y[auto]">
                    <ws-titlebar ws-x="$color[primary]">
                        <ws-text ws-x="$title slot[title]">
                            Page Navigation
                        <//>
                    <//>
                    ${headers.map(
                        (header, index) => html`
                            <a href="#h${index + 1}"
                            ws-x="p[8px] p-l[${header.depth * 16}px] t-sz[&text-size-header]
                            t-deco[none] hover:c[&primary] hover:b-r[3px_solid_var(--primary)]">
                                ${header.text}
                            <//>
                        `
                    )}

                    <ws-titlebar ws-x="$color[secondary]">
                        <ws-text ws-x="$title slot[title]">
                            Site Navigation
                        <//>
                    <//>
                    <ws-flex ws-x="t-sz[&text-size-header]">
                        <${Link} href="/" text="Home" />
                        <${Tree} nodes=${files} />
                    <//>
                <//>
            <//>
        <//>
    `
}
