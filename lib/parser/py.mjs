import yaml from "js-yaml"

import transformNode from "../process-node.mjs"

const py = (code) => {
    const matches = code.matchAll(
        /"""doc(?<docs>(.|\r|\n)*?)"""(.|\r|\n)*?((async\s+)?def\s+)?(?<name>[\w\$]+)/g
    )
    const parts = [...matches].map(
        match => ({ ...match.groups })
    )

    return parts.map(
        parsed => {
            const docs = parsed.docs.trim()
            const info = yaml.load(docs)
            return {
                name: parsed.name,
                ...transformNode(info),
            }
        }
    )
}

export default {
    parse: py,
    extensions: ["py"],
    type: "json",
}
