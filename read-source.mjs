import fs from "fs-jetpack"
import path from "node:path"
import url from "node:url"
import pretty from "xml-beautifier"

const print = (item) => console.dir(item, { depth: null })

const config = (await import("./.ipsen/config.mjs")).default

const templateDir = path.resolve(config.template)

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

const renderPages = async (config, apis, md) => {
    const { out, index = "readme.md" } = config
    const templateModule = await import(
        url.pathToFileURL(
            path.resolve(templateDir, "page.mjs")
        )
    )
    const page = templateModule.default
    const pageInfo = Object.entries(md)
    for (const [key, item] of pageInfo) {
        console.group(`processing: ${key}`)
        const dest =
            (item.file.toLowerCase() === index || pageInfo.length === 1)
            ? path.resolve(out, `index.html`)
            : path.resolve(out, `${key}.html`)

        console.log("rendering page")
        const output = pretty(
            page({ apis, md, item, config })
        ).replace(
            /(<(pre|code)[^>]*?>)\s*/gm,
            (_, tag) => tag
        ).replace(
            /\s*(<\/(pre|code)[^>]*?>)/gm,
            (_, tag) => tag
        )
        console.log("writing", dest)
        fs.write(dest, output)
        console.groupEnd()
    }
}

const files = await scan(config)
const info = await parse(config, files)
// const mapping = await config.template.map(info)
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
// await config.template(config, info)

// print(info)
