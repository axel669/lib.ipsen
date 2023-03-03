import path from "node:path"

import fs from "fs-jetpack"
import { marked } from "marked"

import config from "#config"

marked.use({
    renderer: {
        paragraph: (text) => {
            const iframe = text.match(/^\[\^\] (?<url>.+)$/)

            if (iframe === null) {
                return `<p>${text}</p>\n`
            }

            return `<iframe src="./frames/${iframe.groups.url}"></iframe>\n`
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
