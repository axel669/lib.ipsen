import path from "node:path"
import fs from "fs-jetpack"

import pretty from "xml-beautifier"

import page from "./page.mjs"

const renderPages = async (config, apis, md) => {
    const { out, index = "readme.md" } = config
    const pageInfo = Object.entries(md)
    for (const [key, item] of pageInfo) {
        console.group(`processing: ${key}`)
        const dest =
            (item.file.toLowerCase() === index || pageInfo.length === 1)
                ? path.resolve(out, `index.html`)
                : path.resolve(out, `${key}.html`)

        console.log("rendering page")
        const output = pretty(
            page({ apis, md, item, config })
        ).replace(
            /(<(pre|code)[^>]*?>)\s*/gm,
            (_, tag) => tag
        ).replace(
            /\s*(<\/(pre|code)[^>]*?>)/gm,
            (_, tag) => tag
        )
        console.log("writing", dest)
        fs.write(dest, output)
        console.groupEnd()
    }
}

export default renderPages
