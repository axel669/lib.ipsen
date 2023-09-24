import fs from "fs-jetpack"
import path from "node:path"
import url from "node:url"

const print = (item) => console.dir(item, { depth: null })

const importFile = (file) => import(
    url.pathToFileURL(file)
)

const localRoot = path.resolve(".ipsen")
const internalRoot = path.resolve(
    path.dirname(
        url.fileURLToPath(import.meta.url)
    ),
    "lib"
)
const config = (await importFile(
    path.resolve(localRoot, "config.mjs")
)).default

const resolveDir = (type, dir) => {
    if (dir.startsWith("#") === true) {
        return path.resolve(internalRoot, type, dir.slice(1))
    }
    return path.resolve(localRoot, type, dir)
}
const templateDir = resolveDir("templates", config.template)

const scan = async (config) => {
    const { dir, parsers } = config
    const extensions = new Set(
        parsers.map(
            parser => parser.extensions
        ).flat(1)
    )
    const ignore = config.ignore ?? []
    const globs = [
        `**/*.{${[...extensions].join(",")}}`,
        "!**/node_modules/*",
        ...ignore.map(glob => `!${glob}`)
    ]

    const files = fs.find(dir, { matching: globs })

    return files.map(
        file => file.replace(/\\/g, "/")
    )
}
const parse = async (config, files) => {
    const parsers = config.parsers.reduce(
        (map, parser) => {
            for (const ext of parser.extensions) {
                map[`.${ext}`] = parser
            }
            return map
        },
        {}
    )
    const info = []
    for (const file of files) {
        const ext = path.extname(file)
        const code = fs.read(file)
        const parser = parsers[ext]
        const content = parser.parse(code)

        info.push({
            ext,
            content,
            file: file.slice(config.dir.length + 1),
            type: parser.type,
        })
    }
    return info
}

const templateModule = await importFile(
    path.resolve(templateDir, "render.mjs")
)
const renderPages = templateModule.default

const files = await scan(config)
const info = await parse(config, files)
const { apis, md } = info.reduce(
    ({ apis, md }, entry) => {
        const ismd = entry.ext === ".md"
        const key = ismd ? entry.file.slice(0, -3) : entry.file
        const target = ismd ? md : apis

        target[key] = entry
        return { apis, md }
    },
    { apis: {}, md: {} }
)
await renderPages(config, apis, md)
fs.copy(
    path.resolve(templateDir, "static"),
    path.resolve(config.out),
    { overwrite: true }
)
