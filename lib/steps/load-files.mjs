import path from "node:path"

import fs from "fs-jetpack"
import glob from "fast-glob"

import config from "#config"
import parsers from "./process-files/comment-parsers.mjs"

const defaultLangs = {
    ".svelte": "svelte",
    ".js": "js",
    ".cjs": "js",
    ".mjs": "js",
    ".py": "python",
}
const hlLang = {
    ...defaultLangs,
}

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

## Code Examples from files
`[$] <Path>` can be used to tell Ipsen it should load the corresponding file
from the `config.examples` folder and put a code block into the markdown.
Helps create code examples without writing huge blocks of code in comments.

## IFrame Examples
`[^] <Path>` can be used to tell Ipsen to embed an iframe in the output html.
It will set the `src` attribute of the frame to the path provided, realtive to
the `config.frames` folder. All iframes are 250px tall, and fill the width of
the content area (so they are smaller on mobile).

[$] markdown-ext.mjs
*/

const sidebarLocationRegex = /^\[@\] (?<sidebar>.+)$/m
const sidebarLocationRegexg = new RegExp(sidebarLocationRegex, "gm")
const examplesRegex = /^\[\$\] (.+)$/gm
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
            .replace(sidebarLocationRegexg, "")
            .replace(
                examplesRegex,
                (_, file) => {
                    const filePath = config.resolve.examples(file)
                    const exampleSource = fs.read(filePath)
                    const ext = path.extname(filePath)
                    const lang = hlLang[ext] ?? ext.slice(1)
                    return `\`\`\`${lang}\n${exampleSource}\n\`\`\``
                }
            ),
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
