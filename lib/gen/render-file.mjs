import path from "node:path"
import fs from "fs-jetpack"

import IpsenError from "../err.mjs"

import loadSourceFile from "./load-source-file.mjs"
import emoji from "./emoji.mjs"
import { safeText } from "./safe-text.js"

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

const renderFile = (template, env, info) => {
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

    const { marked } = env

    const baseEnv = {
        vars: env.vars,
        options: env.config.options,
        sidebar: env.sidebar,
        file: (name) => {
            const filePath = path.resolve(env.sourceDir, name)
            return loadSourceFile(env, filePath)
        },
    }

    console.log("rendering", info.destFile)
    const processedMD = md.replace(
        /^\[([^\]\r\n]+)\]: (#+)/mg,
        (_, content, depth) => {
            const [componentName, dataFile, parts] =
                content.split(":").map(part => part.trim())

            if (dataFile === undefined) {
                return template.render(
                    componentName,
                    { ...baseEnv, depth: depth.length }
                )
            }
            const sourceFile = path.resolve(
                path.dirname(file),
                dataFile
            )
            const info = loadSourceFile(env, sourceFile)
            const apiSections =
                (parts.length === 0)
                    ? Object.keys(info)
                    : parts.split(",").map(t => t.trim()).filter(
                        t => t !== ""
                    )
            const apiHTML = apiSections.map(
                name => template.render(
                    componentName,
                    {
                        ...baseEnv,
                        info: info[name],
                        depth: depth.length,
                    }
                )
            )
            return apiHTML.join("\n\n")
        }
    )
    const pageHeadings = processedMD.replace(/^```(.|\r|\n)+?^```/gm, "").matchAll(
        /^(?<depth>\#+) (?<title>[^\r\n]+)$/gm
    )
    const section = pather()
    const headings = [...pageHeadings].map(
        (heading) => {
            const info = {
                depth: heading.groups.depth.length,
                html: marked.parseInline(heading.groups.title)
            }

            const idText = safeText(heading.groups.title)
            info.id = `${section(info.depth)}-${idText}`
            return info
        }
    )
    const html = marked.parse(processedMD)
    let i = 0
    const processedHTML = html.replace(
        /<h(\d)>((.|\r|\n)+?)<\/h\d>/g,
        (_, depth, content) => {
            const head = headings[i]
            i += 1
            return `<h${depth} id="${head.id}">
                <a href="#${head.id}">${content}</a>
            </h${depth}>`
        }
    )

    const pageHTML = template.render(info.template, {
        ...baseEnv,
        title: info.name,
        content: processedHTML,
        basePath: "../".repeat(info.depth),
        destFile: info.destFile.replace(/^index\.html/, ""),
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
