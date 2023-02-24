#!/usr/bin/env node

// * @Home
/*md
# Ipsen

A library for turning markdown inside your comments into a nifty docs site.

## Installation
```bash
pnpm add @axel669/ipsen
```

## Usage
```bash
ipsen
ipsen config.file.mjs
```
*/

import path from "node:path"
import url from "node:url"

import glob from "fast-glob"
import fs from "fs-jetpack"
import sort from "@axel669/array-sort"

import parsers from "./parsers.mjs"
import parseFile from "./parse-file.mjs"
import config, {loadConfig} from "./config.mjs"

/*md
## Config File
> if no config file is given, it will default to `"ipsen.config.mjs"`

```js
// default export contains all the config options
export default {
    clearDest: true,
    title: "Ipsen Example",
    source: "src",
    dest: "site",
    patterns: [],
    readme: {
        dest: ".",
        source: "home.md"
    }
}
```

- ### clearDest `Optional`
    If `true`, removes the dest dir before building.\\
    Useful for ensuring a clean build each time.

- ### dest
    The name of the folder to output all the static files into.

- ### patterns `Optional`
    A set of patterns to include/exclude in the file globbing. The base set of
    patterns is
    `["**\/*.{js,cjs,mjs,svelte,md}", "!**\/$*", "!**\/node_modules\/**\/*"]`

- ### readme `Optional`
    If present, Ipsen will copy a file into readme.md (so you can write docs
    that will be vewiable in places like npm or repos).
    - ### readme.dest
        The output directory for a readme.md file to be saved.

    - ### readme.source
        The file to copy as the readme. Uses the names of the output files (ex
        `home.md`, `misc/func.md`)

- ### source
    The source folder to scan for markdown comments.

- ### title
    Title to display in the title bar of the page.
*/
const [, , configFile = "ipsen.config.mjs"] = process.argv

await loadConfig(configFile)

;(config.defined.clearDest === true) ? fs.remove(config.dir.dest) : null

const files = await glob(
    [
        "**/*.{js,cjs,mjs,svelte,md}",
        "!**/$*",
        "!**/node_modules/**/*",
        ...config.defined.patterns
    ],
    { cwd: config.dir.source }
)

const ensureHome = () => {
    const homeFile = config.resolve.dest("md/home.md")
    if (fs.exists(homeFile) === "file") {
        return
    }
    if (config.defined.home === undefined) {
        console.log("Using default home.md file")
        const defaultHome = fs.read(
            path.resolve(dirname, "default-home.md")
        )
        fs.write(
            homeFile,
            `# ${config.defined.title} - Home\n\n${defaultHome}`
        )
        return
    }
    console.log(`Using ${config.defined.home} for home.md`)
    fs.copy(
        config.resolve.dest(`md/${config.defined.home}`),
        homeFile
    )
}
const processReadme = () => {
    const { readme } = config.defined
    if (readme === undefined) {
        return
    }

    console.log(`Copying ${readme.source} to readme`)
    fs.copy(
        config.resolve.dest(readme.source),
        path.resolve(readme.dest, "readme.md"),
        { overwrite: true }
    )
}

const pages = {}
const processFile = (info) => {
    if (info === null) {
        return
    }
    const { sidebar, location, content } = info
    pages[sidebar] = location
    fs.write(
        config.resolve.dest(`md/${location}.md`),
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
for (const [key, loc] of Object.entries(pages)) {
    const keyPath =
        key.split(/(?<!\/)\/(?!\/)/)
        .map(
            part => part.replace(/\/\//g, "/")
        )
    const path = keyPath.slice(0, -1)
    const name = keyPath[keyPath.length - 1]

    let target = content
    for (const part of path) {
        target[part] = target[part] ?? {}
        target = target[part]
    }
    target[name] = loc
}
const prep = (source) =>
    Object.entries(source)
    .map(
        (entry) =>
            (typeof entry[1] === "string")
            ? entry
            : [entry[0], prep(entry[1])]
    )
    .sort(
        sort.map(
            entry => entry[0],
            sort.natural
        )
    )
const appInfo = {
    sidebar: prep(content),
    title: config.defined.title ?? "Docs",
}
const initCode = `window.appInfo = ${JSON.stringify(appInfo, null, 4)}\n`

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
    config.resolve.dest("viewer.min.js"),
    { overwrite: true }
)

ensureHome()
processReadme()
