import path from "node:path"
import fs from "fs-jetpack"

import config from "./config.mjs"

const hl = {
    ".svelte": "svelte",
    ".js": "js",
    ".cjs": "js",
    ".mjs": "js",
}

const pathFormat = (path) =>
    path.split("/")
        .map(
            part => part.replace(
                /(^|\-)(\w)/g,
                (_0, _1, letter) => ` ${letter.toUpperCase()}`
            )
                .trim()
        )
        .join("/")

const formatExample = (source, file) => {
    if (file === null) {
        return ""
    }

    const ext = path.extname(file)
    const target =
        file.startsWith("/")
            ? config.resolve.source(file.slice(1))
            : path.resolve(source, file)
    const code = fs.read(target)

    return `## Example\n\n\`\`\`${hl[ext]}\n${code}\n\`\`\``
}

const parseFile = (parser, file, ext) => {
    if (parser === undefined) {
        return null
    }
    console.log("scanning:", file)
    const target = config.resolve.source(file)
    const fileContent = fs.read(target)
    const md = parser.content(fileContent)
    const header = parser.headers(fileContent)

    if (md.trim() === "") {
        console.log("no content in", file)
        return null
    }

    const location =
        header.location
        ?? pathFormat(
            file.slice(0, -ext.length)
        )
    const fullContent = [
        `# ${location.split("/").slice(-1)[0]}`,
        md,
        formatExample(target, header.example)
    ].join("\n\n")
        .replace(/\\\\$/gm, "  ")

    const loc = location.toLowerCase()
    return {
        sidebar: location.split("/"),
        location: loc,
        content: fullContent,
    }
}

export default parseFile
