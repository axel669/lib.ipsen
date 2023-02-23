import path from "node:path"
import url from "node:url"

const config = {}

export const loadConfig = async (filename) => {
    const configImport = await import(
        url.pathToFileURL(
            path.resolve(filename)
        )
    )
    config.defined = configImport.default

    config.dir = {
        source: path.resolve(config.defined.source),
        dest: path.resolve(config.defined.dest),
    }
    config.resolve = {
        source: (file) => path.resolve(config.dir.source, file),
        dest: (file) => path.resolve(config.dir.dest, file),
    }
}

export default config
