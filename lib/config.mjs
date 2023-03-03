import path from "node:path"
import url from "node:url"

const [, , configFile = "ipsen.config.mjs"] = process.argv

const config = {}

const configImport = await import(
    url.pathToFileURL(
        path.resolve(configFile)
    )
)
config.file = configImport.default

config.dir = {
    lib: path.dirname(
        url.fileURLToPath(import.meta.url)
    ),
    source: path.resolve(config.file.source.dir),
    dest: path.resolve(config.file.dest.dir),
    examples:
        (config.file.examples !== undefined)
        ? path.resolve(config.file.examples)
        : null,
    frames:
        (config.file.frames !== undefined)
        ? path.resolve(config.file.frames)
        : null,
}
config.resolve = {
    source: (...parts) => path.resolve(config.dir.source, ...parts),
    dest: (...parts) => path.resolve(config.dir.dest, ...parts),
    examples: (...parts) =>
        (config.dir.examples === null)
        ? null
        : path.resolve(config.dir.examples, ...parts)
}

export default config
