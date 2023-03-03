import sort from "@axel669/array-sort"
import fs from "fs-jetpack"
import path from "node:path"

import config from "#config"

const arrayEQ = (a, b) => a.map(
    (part, index) => part === b[index]
).includes(false) === false
const orderNumber = config.file.sidebar ?? {}
const sortEntries = sort.compose(
    sort.map(
        entry => orderNumber[entry.name] ?? 0xfff00,
        sort.number
    ),
    sort.map(
        entry => entry.label,
        sort.natural
    )
)
const sortSidebar = (entries, prefix, depth) => {
    const level = entries.filter(
        parts => (
            parts.length === depth
            && arrayEQ(prefix, parts)
        )
    )

    return level.map(
        place => ({
            label: place[place.length - 1],
            name: place.join("/"),
            items: sortSidebar(entries, place, depth + 1)
        })
    ).sort(sortEntries)
}

const genHash = (sidebar) =>
    sidebar.toLowerCase()
    .replace(/[^\w]+/g, "-")
    .replace(/\-+/g, "-")
export default (contents) => {
    console.log("Generating site config")
    const sidebarMap = contents.reduce(
        (mapping, [file, info]) => {
            mapping[info.sidebar] = file
            return mapping
        },
        {}
    )
    const folders = new Set()
    for (const key of Object.keys(sidebarMap)) {
        const parts = key.split(/(?<!\/)\/(?!\/)/)
        parts.reduce(
            (paths, _, index) => [
                ...paths,
                parts.slice(0, index + 1).join("/")
            ],
            []
        ).forEach(path => folders.add(path))
    }
    const sidebar = sortSidebar(
        [...folders].map(folder => folder.split(/(?<!\/)\/(?!\/)/)),
        [],
        1
    )
    const siteConfig = {
        title: config.file.title,
        defaultTheme: config.file.site.defaultTheme,
        sidebar,
        sidebarMap: contents.reduce(
            (map, [_, info]) => {
                map[genHash(info.sidebar)] = info.outputFileName
                return map
            },
            { index: `${config.file.site.index ?? "home"}.html` }
        )
    }
    const siteConfigJS = JSON.stringify(
        siteConfig,
        function (key, value) {
            if (key === "label") {
                return value.replace(/\/\//g, "/")
            }
            if (key === "name") {
                return undefined
            }
            if (key === "items" && value.length === 0) {
                return genHash(this.name)
            }
            return value
        },
        4
    )
    fs.write(
        config.resolve.dest("content.js"),
        `window.siteConfig = ${siteConfigJS}`
    )
    fs.copy(
        path.resolve(config.dir.lib, "dist/index.html"),
        config.resolve.dest("index.html")
    )
    fs.copy(
        path.resolve(config.dir.lib, "dist/viewer.min.js"),
        config.resolve.dest("viewer.min.js")
    )

    return contents
}
