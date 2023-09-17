import fs from "fs-jetpack"
import path from "node:path"
import render from "preact-render-to-string/jsx"

import js from "./src/parser/js.mjs"
import md from "./src/parser/md.mjs"
import py from "./src/parser/py.mjs"

import basicTemplate from "./templates/basic/generate.mjs"
import basicPage from "./templates/basic/page.mjs"

const print = (item) => console.dir(item, { depth: null })

const config = {
    dir: "test",
    out: "site",
    parsers: [js, md, py],
    template: {
        map: basicTemplate,
        page: basicPage
    },
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

const generate = async (config, mapping) => {
    const { out } = config
    const { page } = config.template
    for (const [key, item] of Object.entries(mapping)) {
        console.group(`processing: ${key}`)
        const dest = path.resolve(out, `${key}.html`)

        console.log("rendering page")
        const output = render(
            page({ mapping, item }),
            {},
            { pretty: true }
        )
        console.log("writing", dest)
        fs.write(dest, output)
        console.groupEnd()
    }
}

const files = await scan(config)
const info = await parse(config, files)
const mapping = await config.template.map(info)
await generate(config, mapping)
// await config.template(config, info)

// print(info)
