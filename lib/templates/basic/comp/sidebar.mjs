import html from "./html.mjs"

const createNode = (nodes, name, path) => {
    const node = { name, path, children: [] }
    nodes.push(node)
    return node
}
const insertNode = (nodes, path, d = 0) => {
    if (d === path.length) {
        return
    }
    const target = path[d]

    const dest =
        nodes.find(
            node => node.name === target
        )
        ?? createNode(nodes, target, path)
    insertNode(dest.children, path, d + 1)
}
const treeify = (list) => {
    const nodes = []

    for (const item of list) {
        const path = item.split("/")
        insertNode(nodes, path)
    }

    return nodes
}

const Tree = ({ nodes, d = 0 }) => nodes.map(
    node =>
        (node.children.length === 0)
        ? html`
            <a href="${node.path.join("/")}.html"
            ws-x="block t-deco[none] hover:t-deco[underline]
            hover:b-r[3px_solid_var(--secondary)]">
                <ws-icon class="ti-file-text"><//>
                ${node.name}
            <//>
        `
        : html`
            <div>
                <ws-icon class="ti-folder"><//> ${node.name}
                <ws-flex ws-x="p-l[16px] p-r[0px]">
                    <${Tree} nodes=${node.children} />
                <//>
            <//>
        `
)

export default ({ md, headers }) => {
    const files = treeify(Object.keys(md))
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
                            t-deco[none] hover:t-deco[underline] hover:b-r[3px_solid_var(--primary)]">
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
                        <${Tree} nodes=${files} />
                    <//>
                <//>
            <//>
        <//>
    `
}
