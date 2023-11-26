const lines = (...lines) => lines.filter(l => l !== null).join("\n")

const type = (type) => {
    if (type === undefined) {
        return null
    }
    if (type.tags.length === 0) {
        return `**${type.base}**`
    }
    return `**${type.base}** _${type.tags.join(", ")}_`
}
const argList = (args, indent) => {
    const nextIndent = `${indent}  `
    return args.map(
        arg => lines(
            `${indent}- \`${arg.name}\`  `,
            `${indent}  ${type(arg.type) ?? ""}`,
            "",
            `${indent}  > ${arg.desc}`,
            ...argList(arg.props, nextIndent)
        )
    )
}
const args = (args, heading) => {
    if (args === null || args === undefined) {
        return null
    }
    if (args.length === 0) {
        return "Function does not take any arguments"
    }
    return lines(
        `${heading}# Arguments`,
        ...argList(args, ""),
        "",
    )
}

export default (api, depth) => {
    const heading = "#".repeat(depth)
    return lines(
        `${heading} ${api.name}`,
        type(api.type),
        "",
        api.desc,
        "",
        args(api.args, heading),
        api.return !== undefined ? `Returns: ${type(api.return)}` : null,
    )
}
