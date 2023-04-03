import path from "node:path"

import fs from "fs-jetpack"
import glob from "fast-glob"

import config from "#config"
import parsers from "./process-files/comment-parsers.mjs"

const supported = Object.keys(parsers).join(",")

/*md
[@] Markdown Extensions
# Markdown Extensions

Ipsen has added a couple of shorthands to allow embedding extra information in
the markdown comments without cluttering them.

## Sidebar Path
`[@] <Path>` can be used to tell Ipsen to use a specific sidebar path instead of
generating one from the file location. Write as a normal path using `/` to
delimit the expandable sections, and `//` can be used as an escape sequence to
put a "/" into the sidebar item label.

## YAML Embeds
Using `{yaml}` at the start of a paragraph will allow the remaining lines to be
interpreted as yaml and used to embed iframe previews and code examples from
files.

iframe examples will be embedded if the `frame` property is defined in the yaml.
The examples are loaded from the directory in `config.frames`. iframes are 300px
tall by default, but can be changed by defining a `height` property in the yaml.

Code examples will be read from files inside the directory in `config.examples`
and embedded if the `code` property is defined.

If a single yaml block has both `frame` and `code` defined, the iframe will be
shown as normal, but will include a toggle to show the code overlaid on top of
the frame.

{yaml}
code: markdown-ext.mjs
*/

const sidebarLocationRegex = /^\[@\] (?<sidebar>.+)$/m
const sidebarLocationRegexg = new RegExp(sidebarLocationRegex, "gm")
const readFileInfo = (file) => {
    console.log("Scannng", file)
    const ext = path.extname(file)
    const fileContent = fs.read(
        config.resolve.source(file)
    )
    const md = parsers[ext](fileContent)

    if (md.trim() === "") {
        return null
    }

    const sidebar =
        md.match(sidebarLocationRegex)?.groups?.sidebar
        ?? file.slice(0, -ext.length)
    const outputFileName = `${file}.html`

    return {
        md: md.replace(/\\\\$/gm, "  ")
            .replace(sidebarLocationRegexg, ""),
        outputFileName,
        sidebar,
    }
}

export default async () => {
    const files = await glob(
        [
            `**/*{${supported}}`,
            "!**/$*",
            "!**/node_modules/**/*",
            ...config.file.source.patterns
        ],
        { cwd: config.dir.source }
    )

    const contents = {}
    for (const file of files) {
        contents[file] = readFileInfo(file)
    }

    return Object.entries(contents).filter(
        (entry) => entry[1] !== null
    )
}
