#!/usr/bin/env node

import path from "node:path"
import url from "node:url"

import glob from "fast-glob"
import fs from "fs-jetpack"

import parsers from "./parsers.mjs"
import parseFile from "./parse-file.mjs"
import config, {loadConfig} from "./config.mjs"

const [, , configFile = "ipsen.config.mjs"] = process.argv

await loadConfig(configFile)

fs.remove(config.dir.dest)

const files = await glob(
    [
        "**/*.{js,cjs,mjs,svelte,md}",
        "!**/$*",
        "!**/node_modules/**/*",
        ...config.defined.patterns
    ],
    { cwd: config.dir.source }
)

const pages = new Map()
const processFile = (info) => {
    if (info === null) {
        return
    }
    const { sidebar, location, content } = info
    pages.set(sidebar, location)
    fs.write(
        config.resolve.dest(`${location}.md`),
        content
    )
}
for (const file of files) {
    const ext = path.extname(file)
    const parser = parsers[ext]
    const info = parseFile(parser, file, ext)
    processFile(info)
}

const content = {}
for (const [key, loc] of pages.entries()) {
    const path = key.slice(0, -1)
    const name = key[key.length - 1]

    let target = content
    for (const part of path) {
        target[part] = target[part] ?? {}
        target = target[part]
    }
    target[name] = loc
}
const appInfo = {
    sidebar: content,
    title: config.defined.title ?? "Docs",
}
const initCode = `window.appInfo = ${JSON.stringify(appInfo, null, 4)}
`

fs.write(
    config.resolve.dest("content.js"),
    initCode
)

const dirname = path.dirname(
    url.fileURLToPath(import.meta.url)
)
console.log("Copying viewer files")
const index = fs.read(
    path.resolve(dirname, "dist/index.html")
)
fs.write(
    config.resolve.dest("index.html"),
    index.replace("$$title", `Docs - ${config.defined.title}`)
)
fs.copy(
    path.resolve(dirname, "dist/viewer.min.js"),
    config.resolve.dest("viewer.min.js")
)

const homeFile = config.resolve.dest("home.md")
if (fs.exists(homeFile) === "file") {
    process.exit(0)
}
const defaultHome = fs.read(
    path.resolve(dirname, "default-home.md")
)
fs.write(
    homeFile,
    `# ${config.defined.title} - Home\n\n${defaultHome}`
)
