const createNode = (args) => {
    const { nodes, target, item, dir } = args
    const nodeBase = {
        name: target,
        type: dir ? "dir" : "file"
    }
    const node =
        dir
        ? {...nodeBase, children: [] }
        : { ...nodeBase, source: item.path, out: item.contentPath }
    nodes.push(node)
    return node
}
const insertNode = (args) => {
    const { nodes, path, item, d } = args

    const target = path[d]

    const dest =
        nodes.find(node => node.name === target)
        ?? createNode({ nodes, target, item, dir: d !== (path.length - 1) })
    if (dest.type === "file") {
        return
    }
    insertNode({
        nodes: dest.children,
        d: d + 1,
        path,
        item,
    })
}
const treeify = (list) => {
    const root = {
        name: null,
        type: "dir",
        children: []
    }

    for (const item of list) {
        const path = item.contentPath.split("/")
        insertNode({
            nodes: root.children,
            path,
            item,
            d: 0,
        })
    }

    return root
}

export default treeify
