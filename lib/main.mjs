#!/usr/bin/env node

// * @Home
/*md
# Ipsen

A library for turning markdown inside your comments into a nifty docs site.

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

import parsers from "./parsers.mjs"
import parseFile from "./parse-file.mjs"
import config, {loadConfig} from "./config.mjs"

/*md
## Config File
> if no config file is given, it will default to `"ipsen.config.mjs"`

```js
// default export contains all the config options
export default {
    // Title to display on the title bar of the page
    title: "Ipsen Example",
    // The source folder to scan
    source: "src",
    // The output folder
    dest: "site",
    // Optional
    // A set of patterns to include in the file globbing.
    // The base set of patterns is
    // ["**\/*.{js,cjs,mjs,svelte,md}", "!**\/$*", "!**\/node_modules\/**\/*"]
    patterns: [],
    // Optional
    // If true, removes the dest dir before building. Useful for ensuring a
    // a clean build each time.
    clearDest: true,
}
```

### patterns `Optional`

A set of patterns to include/exclude in the file globbing. The base set of
patterns is
`["**\/*.{js,cjs,mjs,svelte,md}", "!**\/$*", "!**\/node_modules\/**\/*"]`
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
