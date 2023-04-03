import path from "node:path"

import fs from "fs-jetpack"
import { marked } from "marked"
import yaml from "yaml"

import config from "#config"

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

const genFrame = (info) => {
    if (info.frame === undefined) {
        return null
    }
    const height = info.height ?? "300px"
    return `<iframe style="height: ${height};" src="./frames/${info.frame}"></iframe>\n`
}
const genExample = (info) => {
    if (info.code === undefined) {
        return null
    }
    const file = info.code
    const filePath = config.resolve.examples(file)
    const exampleSource =
        fs.read(filePath)
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
    const ext = path.extname(filePath)
    const lang = hlLang[ext] ?? ext.slice(1)
    return `<pre><code class="language-${lang}">${exampleSource}</code></pre>`
}
marked.use({
    walkTokens(token) {
        if (token.type !== "paragraph") {
            return
        }
        if (token.text.startsWith("{yaml}") === false) {
            return
        }
        token.tokens[0].text = token.raw
    },
    renderer: {
        paragraph: (text) => {
            if (text.startsWith("{yaml}") === true) {
                const info = yaml.parse(text.slice(6))
                const frame = genFrame(info)
                const example = genExample(info)

                if (frame !== null) {
                    if (example !== null) {
                        const id = Math.random().toString(16)
                        return `
                            <div class="toggle-view">
                                <input type="checkbox" id="${id}" />
                                <label for="${id}">&nbsp;Code</label>
                                ${frame}
                                ${example}
                            </div>
                        `
                    }
                    return frame
                }

                return example
            }

            return `<p>${text}</p>\n`
        }
    }
})
const copyFrames = () => {
    if (config.file.frames === undefined) {
        return
    }

    fs.copy(
        config.dir.frames,
        config.resolve.dest("frames")
    )
}
const ensureIndex = () => {
    if (config.file.site?.index !== undefined) {
        return
    }
    const target = config.resolve.dest("home.html")

    if (fs.exists(target) === "file") {
        return
    }

    fs.copy(
        path.resolve(config.dir.lib, "default-home.html"),
        target
    )
}
export default (contents) => {
    console.log("Saving site content")
    for (const [file, info] of contents) {
        const htmlContent = marked.parse(info.md)
        const htmlFile = config.resolve.dest("docs", `${file}.html`)
        fs.write(htmlFile, htmlContent)
    }
    copyFrames()
    ensureIndex()
    return contents
}
