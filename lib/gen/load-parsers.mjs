import path from "node:path"
import url from "node:url"

const importFile = (file) => import(
    url.pathToFileURL(file)
)

export default async (config, local, internal) => {
    const parserEntries = Object.entries(config.parsers)
    const parsers = {}
    for (const [key, source] of parserEntries) {
        const file =
            (source.startsWith("@") === true)
            ? path.resolve(internal, "parser", `${source.slice(1)}.mjs`)
            : path.resolve(local, "parser", `${source}.mjs`)
        const parser = await importFile(file)
        parsers[`.${key}`] = parser.default
    }
    return parsers
}
