import fs from "fs-jetpack"
import path from "node:path"
import url from "node:url"
// import fm from "yaml-front-matter"
import yaml from "js-yaml"

// import treeify from "./lib/treeify.mjs"

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
const config = yaml.load(
    fs.read(
        path.resolve(localRoot, "config.yaml")
    )
)

const resolveDir = (type, dir) => {
    if (dir.startsWith("@") === true) {
        return path.resolve(internalRoot, type, dir.slice(1))
    }
    return path.resolve(localRoot, type, dir)
}

const scan = async (config) => {
    const { source, parsers } = config
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

    const files = fs.find(source, { matching: globs })

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
    const data = {}
    for (const file of files) {
        const ext = path.extname(file)
        const code = fs.read(file)
        const parser = parsers[ext]
        const items = parser.parse(code)
        const filepath = file.slice(config.source.length + 1)

        const contentInfo = {
            items,
            path: filepath,
            contentPath: filepath.slice(0, -ext.length),
        }

        data[contentInfo.path] = contentInfo
    }
    return data
}

const destDir = path.resolve(config.dest)

const files = await scan(config)
const data = await parse(config, files)

// const index = info.content[config.index?.file ?? "readme.md"]
// const content = Object.values(info.content).filter(item => item !== index)
// const fileTree = treeify(content)

// info.contentTree = config.modifyTree?.(fileTree) ?? fileTree
// info.contentTree.children.unshift({
//     name: config.index.name ?? "Home",
//     out: "index",
//     type: "file",
//     source: index?.path ?? null
// })

const render = (node) => {
    if (node.type === "dir") {
        node.children.forEach(render)
        return
    }

    const destFile = path.resolve(
        destDir,
        `${node.out}.html`
    )
    console.log(destFile)
}

render(info.contentTree)
