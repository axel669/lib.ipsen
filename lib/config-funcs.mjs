const node = (tree, names, index) => {
    if (index === names.length) {
        return tree
    }

    const target = names[index]
    const next = tree.children.find(
        child => child.name === target
    )
    if (next === undefined) {
        return null
    }
    return node(next, names, index + 1)
}
const entry = (tree, name) => node(
    tree,
    name.split("/"),
    0
)

export { entry }
