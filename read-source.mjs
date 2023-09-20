import fs from "fs-jetpack"
import path from "node:path"
import pretty from "xml-beautifier"

import js from "./src/parser/js.mjs"
import md from "./src/parser/md.mjs"
import py from "./src/parser/py.mjs"

import basic from "./templates/basic/template.mjs"

const print = (item) => console.dir(item, { depth: null })

const config = {
    dir: "test",
    out: "site",
    parsers: [js, md, py],
    template: basic,
}

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

const renderPages = async (config, mapping) => {
    const { out } = config
    const { page } = config.template
    for (const [key, item] of Object.entries(mapping)) {
        console.group(`processing: ${key}`)
        const dest = path.resolve(out, `${key}.html`)

        console.log("rendering page")
        const output = pretty(
            page({ mapping, item, config })
        )
        console.log("writing", dest)
        fs.write(dest, output)
        console.groupEnd()
    }
}

const files = await scan(config)
const info = await parse(config, files)
const mapping = await config.template.map(info)
await renderPages(config, mapping)
// await config.template(config, info)

// print(info)
