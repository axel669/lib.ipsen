import yaml from "js-yaml"

import transformNode from "../process-node.mjs"

const js = (code) => {
    const matches = code.matchAll(
        /\/\*doc(?<docs>(.|\r|\n)*?)\*\/(.|\r|\n)*?(const|let|function|class)\s+(?<name>[\w\$]+)/g
    )
    const parts = [...matches].map(
        match => ({ ...match.groups })
    )

    return parts.map(
        parsed => {
            const docs = parsed.docs.trim()
            const info = yaml.load(docs)
            return {
                ...transformNode(info),
                name: parsed.name,
            }
        }
    )
}

export default {
    parse: js,
    extensions: ["js", "cjs", "mjs"],
    type: "json",
}
