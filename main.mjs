import fs from "fs-jetpack"
import path from "node:path"
import url from "node:url"
import yaml from "js-yaml"
import { marked } from "marked"

import compile from "./lib/burger/compile.mjs"
import loadParsers from "./lib/load-parsers.mjs"
import apiToMD from "./lib/api-to-md.mjs"

const print = (item) => console.dir(item, { depth: null })

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

const resolve = (...parts) => {
    const last = parts[parts.length - 1]
    if (last.startsWith("@") === true) {
        const paths = parts.slice(0, -1)
        return path.resolve(internalRoot, ...paths, last.slice(1))
    }
    return path.resolve(localRoot, ...parts)
}

const sourceFile = path.resolve(config.source)
const sourceDir = path.dirname(sourceFile)
const siteMD = fs.read(sourceFile)

const destDir = path.resolve(config.dest)

const tokens = marked.lexer(siteMD)

const title = tokens.find(
    tok => tok.type === "heading"
)
const index = tokens.find(
    tok => tok.type === "paragraph"
)
const fileSource = tokens.find(
    tok => tok.type === "list"
)

const scanList = (list) => {
    if (list === undefined) {
        return []
    }
    const items = list.items.filter(
        item => item.type === "list_item"
    )

    return items.map(
        item => {
            const text = item.tokens.find(tok => tok.type === "text")
            return {
                name: text.tokens[0].text,
                file: text.tokens[0].href,
                destFile: `${text.tokens[0].href?.slice(0, -3) ?? ""}.html`,
                sublist: scanList(
                    item.tokens.find(tok => tok.type === "list")
                ),
            }
        }
    )
}

const sidebar = [
    {
        name: index.tokens[0].text,
        file: index.tokens[0].href,
        destFile: "index.html",
        sublist: [],
    },
    ...scanList(fileSource)
]

const templateDir = resolve("template", config.template)
const renderPage = compile(
    path.resolve(templateDir, "page.html")
)

const vars = fs.read(
    path.resolve(templateDir, "vars.json"),
    "json"
) ?? {}
const parsers = await loadParsers(config, localRoot, internalRoot)
const dataCache = {}
const loadData = (file) => {
    if (dataCache[file] !== undefined) {
        return dataCache[file]
    }
    console.log("parsing:", file)
    const source = fs.read(file)
    if (source === undefined) {
        throw new Error(`could not read file: ${file}`)
    }
    const ext = path.extname(file)
    const info = parsers[ext](source)
    dataCache[file] = info
    return info
}

const pather = () => {
    const path = []

    return (len) => {
        while (path.length < len) {
            path.push(0)
        }
        while (path.length > len) {
            path.pop()
        }
        path[path.length - 1] += 1
        return path.join(".")
    }
}

const rendered = []
const renderFile = (info) => {
    if (info.file === undefined) {
        return
    }
    if (rendered.includes(info.file) === true) {
        return
    }
    rendered.push(info.file)
    const file = path.resolve(sourceDir, info.file)
    const md = fs.read(file)
    console.log("rendering", info.destFile)
    const processedMD = md.replace(
        /^\[(?<parts>[^:\r\n]*):\s*(?<file>[^\]\r\n]+)\]: (?<depth>#+)/mg,
        (...args) => {
            const api = {...args[args.length - 1]}
            const sourceFile = path.resolve(
                path.dirname(file),
                api.file
            )
            const info = loadData(sourceFile)
            const parts =
                (api.parts.trim().length === 0)
                ? Object.keys(info)
                : api.parts.split(",").map(t => t.trim()).filter(
                    t => t !== ""
                )
            return parts.map(
                name => apiToMD(info[name], api.depth.length)
            ).join("\n\n")
        }
    )
    const pageHeadings = processedMD.matchAll(
        /^(?<depth>\#+) (?<title>.+)$/gm
    )
    const section = pather()
    const headings = [...pageHeadings].map(
        (heading) => {
            const info = {
                depth: heading.groups.depth.length,
                html: marked.parseInline(heading.groups.title)
            }

            const idText =
                heading.groups.title
                .replace(/[^a-zA-Z0-9 ]/g, "")
                .replace(/ /g, "-")
                .toLowerCase()
            info.id = `${section(info.depth)}-${idText}`
            return info
        }
    )
    // console.log(headings)
    const html = marked.parse(processedMD)
    let i = 0
    const processedHTML = html.replace(
        /<h(\d)>/g,
        (_, depth) => {
            const head = headings[i]
            i += 1
            return `<h${depth} id="${head.id}">`
        }
    ).replace(
        /<pre><code class="language-mermaid">((.|\r|\n)+?)<\/code><\/pre>/g,
        (_, code) => {
            return `<pre class="mermaid">${code}</pre>`
        }
    )

    const pageHTML = renderPage({
        title: info.name,
        content: processedHTML,
        vars,
        options: config.options,
        sidebar,
        headings,
    })
    fs.write(
        path.resolve(destDir, info.destFile),
        pageHTML
    )
}

// print(sidebar)
const render = (files) => {
    for (const info of files) {
        renderFile(info)
        render(info.sublist ?? [])
    }
}
render(sidebar)
fs.copy(
    path.resolve(localRoot, "static"),
    destDir,
    { overwrite: true }
)
