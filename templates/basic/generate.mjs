import path from "node:path"
import fs from "fs-jetpack"
import render from "preact-render-to-string/jsx"

// import html from "../html.mjs"
import page from "./page.mjs"

const build = async (config, info) => {
    const { out } = config

    const groups = info.reduce(
        (groups, entry) => {
            const key = entry.file.slice(0, -entry.ext.length)
            groups[key] = groups[key] ?? []
            groups[key].push(entry)
            return groups
        },
        {}
    )

    for (const [key, entries] of Object.entries(groups)) {
        const dest = path.resolve(out, `${key}.html`)

        const api = entries.find(ent => ent.ext !== ".md")
        const md = entries.find(ent => ent.ext === ".md")

        console.log(dest)
        const output = render(
            page({ api, md }),
            // html`<${page} api=${api} md=${md} />`,
            {},
            { pretty: true }
        )
        fs.write(dest, output)
    }
}

export default build
