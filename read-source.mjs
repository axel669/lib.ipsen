import fs from "fs-jetpack"
import path from "node:path"

import js from "./src/parser/js.mjs"
import md from "./src/parser/md.mjs"
import py from "./src/parser/py.mjs"

import basicTemplate from "./templates/basic/generate.mjs"

const print = (item) => console.dir(item, { depth: null })

const config = {
    dir: "test",
    parsers: [js, md, py],
    template: basicTemplate,
    out: "site",
}

const scan = async (config) => {
    const { dir, parsers } = config
    const extensions = new Set(
        parsers.map(
            parser => parser.extensions
        ).flat(1)
    )
    // const glob = `**/*.{${[...extensions].join(",")}}`
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

const files = await scan(config)
const info = await parse(config, files)
await config.template(config, info)

// print(info)
