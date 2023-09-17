// import path from "node:path"
// import fs from "fs-jetpack"
// import render from "preact-render-to-string/jsx"

// import html from "../html.mjs"
// import page from "./page.mjs"

const build = async (info) => info.reduce(
    (groups, entry) => {
        const key = entry.file.slice(0, -entry.ext.length)
        groups[key] = groups[key] ?? []
        groups[key].push(entry)
        return groups
    },
    {}
)

export default build
