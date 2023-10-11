import yaml from "js-yaml"

import transformNode from "../process-node.mjs"

export default (code) => {
    const matches = code.matchAll(
        /\/\*doc(?<docs>(.|\r|\n)*?)\*\/(.|\r|\n)*?(export\s+)?(const|let|function|class)\s+(?<name>[\w\$]+)/g
    )
    const parts = [...matches].map(
        match => ({ ...match.groups })
    )

    return parts.reduce(
        (parts, parsed) => {
            const docs = parsed.docs.trim()
            const info = yaml.load(docs)
            parts[parsed.name] = {
                name: parsed.name,
                ...transformNode(info),
            }
            return parts
        },
        {}
    )
}

// export default {
//     parse: js,
//     extensions: ["js", "cjs", "mjs"],
// }
