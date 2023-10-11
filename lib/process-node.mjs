const strcmp = new Intl.Collator().compare

const insertProp = (list, parts, info) => {
    const last = list[list.length - 1]
    if (list.length === 0 || last.name !== parts[0]) {
        list.push(info)
        return
    }
    insertProp(last.props, parts.slice(1), info)
}
const transformTypeNode = (typeinfo) => {
    if (typeinfo === null || typeinfo === undefined) {
        return typeinfo
    }
    if (typeof typeinfo === "string") {
        const [base, ...tags] = typeinfo.split(".")
        return { base, tags }
    }
    const pairs = Object.entries(typeinfo)
    const namePair = pairs.find(
        ([key]) => key.startsWith(".") === false
    )
    const propPairs = pairs.filter(pair => pair !== namePair)
    propPairs.sort(strcmp)

    const props = []
    for (const [key, desc] of propPairs) {
        const [path, type] = key.split("|")
        const parts = path.slice(1).split(".")
        const baseInfo =
            (typeof desc === "string")
            ? { desc }
            : desc
        insertProp(
            props,
            parts,
            {
                ...baseInfo,
                type: transformTypeNode(type),
                props: [],
                name: parts[parts.length - 1]
            }
        )
    }

    const [key, desc = ""] = namePair
    const [name, type] = key.split("|")
    return {
        name,
        type: transformTypeNode(type),
        desc,
        props
    }
}
const transformNode = (node) => ({
    ...node,
    type: transformTypeNode(node.type),
    args: node.args?.map?.(transformTypeNode),
    return: transformTypeNode(node.return),
})

export default transformNode
