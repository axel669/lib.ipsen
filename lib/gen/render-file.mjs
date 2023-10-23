import path from "node:path"
import fs from "fs-jetpack"

import { marked } from "marked"
import prism from "prismjs"
import loadLang from "prismjs/components/index.js"

import loadSourceFile from "./load-source-file.mjs"
import IpsenError from "../err.mjs"

import emoji from "./emoji.mjs"

const pather = () => {
    const path = []

    return (len) => {
        while (path.length < len) {
            path.push(0)
        }
        while (path.length > len) {
            path.pop()
        }
        path[path.length - 1] += 1
        return path.join(".")
    }
}

marked.use({
    renderer: {
        code(code, lang) {
            if (lang === "mermaid") {
                return `<pre class="mermaid">${code}</pre>`
            }
            loadLang(lang)
            const converted = prism.highlight(code, prism.languages[lang], lang)
            return `<pre class="language-${lang}">${converted}</pre>`
        }
    }
})

const renderFile = (env, info) => {
    if (info.file === undefined) {
        return
    }
    if (env.rendered.includes(info.file) === true) {
        return
    }
    env.rendered.push(info.file)
    const file = path.resolve(env.sourceDir, info.file)
    const md = fs.read(file)

    if (md === undefined) {
        throw new IpsenError(
            `Unable to load content file ${info.file} (${file})`
        )
    }

    console.log("rendering", info.destFile)
    const processedMD = md.replace(
        /^\[(?<parts>[^:\r\n]*):\s*(?<file>[^\]\r\n:]+):\s*(?<component>[^\]\r\n]+)\]: (?<depth>#+)/mg,
        (...args) => {
            const api = { ...args[args.length - 1] }
            const sourceFile = path.resolve(
                path.dirname(file),
                api.file.trim()
            )
            const info = loadSourceFile(env, sourceFile)
            const apiSections =
                (api.parts.trim().length === 0)
                    ? Object.keys(info)
                    : api.parts.split(",").map(t => t.trim()).filter(
                        t => t !== ""
                    )
            const apiHTML = apiSections.map(
                // name => apiToMD(info[name], api.depth.length)
                name => env.render(
                    api.component.trim(),
                    {
                        info: info[name],
                        depth: api.depth.length,
                    }
                )
            )
            return apiHTML.join("\n\n")
        }
    )
    // console.log(processedMD)
    const pageHeadings = processedMD.matchAll(
        /^(?<depth>\#+) (?<title>.+)$/gm
    )
    const section = pather()
    const headings = [...pageHeadings].map(
        (heading) => {
            const info = {
                depth: heading.groups.depth.length,
                html: marked.parseInline(heading.groups.title)
            }

            const idText =
                heading.groups.title
                    .replace(/[^a-zA-Z0-9 ]/g, "")
                    .replace(/ /g, "-")
                    .toLowerCase()
            info.id = `${section(info.depth)}-${idText}`
            return info
        }
    )
    const html = marked.parse(processedMD)
    let i = 0
    const processedHTML = html.replace(
        /<h(\d)>/g,
        (_, depth) => {
            const head = headings[i]
            i += 1
            return `<h${depth} id="${head.id}">`
        }
    ).replace(
        /<pre><code class="language-mermaid">((.|\r|\n)+?)<\/code><\/pre>/g,
        (_, code) => {
            return `<pre class="mermaid">${code}</pre>`
        }
    )

    // console.log("template:", info.template)
    const pageHTML = env.render(info.template, {
        title: info.name,
        content: processedHTML,
        vars: env.vars,
        options: env.config.options,
        sidebar: env.sidebar,
        data: env.data,
        headings,
    })
    fs.write(
        path.resolve(env.destDir, info.destFile),
        pageHTML.replace(
            /:(\w+):/g,
            (match, name) => emoji[name] ?? match
        )
    )
}

export default renderFile
