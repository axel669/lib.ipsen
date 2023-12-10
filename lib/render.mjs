import fs from "fs-jetpack"
import path from "node:path"
import url from "node:url"
import yaml from "js-yaml"
import prism from "prismjs"

import loadParsers from "./gen/load-parsers.mjs"
import loadSourceFile from "./gen/load-source-file.mjs"

import renderFile from "./gen/render-file.mjs"
import transformTokens, { parseSidebarHref } from "./gen/transform-tokens.mjs"

import IpsenError from "./err.mjs"

import buildTemplate from "./gen/template.js"
import customMarked from "./gen/custom-marked.js"

const generateFileMap = (dir, list, map) => {
    for (const entry of list) {
        if (entry.file !== undefined) {
            map[path.resolve(dir, entry.file)] = entry.destFile
        }
        generateFileMap(dir, entry.sublist, map)
    }
    return map
}

export default async (options = {}) => {
    const env = {
        renderOptions: options,
        rendered: [],
        dataCache: [],
    }

    const localRoot = path.resolve(".ipsen")
    const internalRoot = path.resolve(
        path.dirname(
            url.fileURLToPath(import.meta.url)
        )
    )

    const configText = fs.read(
        path.resolve(localRoot, "config.yml")
    )
    if (configText === undefined) {
        throw new IpsenError("Could not find config.yml file in .ipsen folder")
    }
    const config = yaml.load(configText)
    env.config = config

    for (const extension of (config.langPlugins ?? [])) {
        await import(extension)
    }
    env.prism = prism

    const templateRoot = {
        internal: path.resolve(internalRoot, "template"),
        local: path.resolve(localRoot, "template"),
    }
    const template = buildTemplate({
        templateName: config.template,
        location: templateRoot,
    })

    const marked = customMarked(template)
    env.marked = marked

    const sourceFile = path.resolve(config.source)
    env.sourceDir = path.dirname(sourceFile)
    env.destDir = path.resolve(config.dest)

    if (options.dev === true) {
        console.log("deleting existing destination directory")
        fs.remove(env.destDir)
    }

    const siteTokens = marked.lexer(
        fs.read(sourceFile)
    )
    const index = siteTokens.find(
        tok => tok.type === "paragraph"
    )
    const fileSource = siteTokens.find(
        tok => tok.type === "list"
    )

    env.sidebar = [
        {
            name: index.tokens[0].text,
            ...parseSidebarHref(index.tokens[0].href, "."),
            destFile: "index.html",
            sublist: [],
        },
        ...transformTokens(fileSource)
    ]
    env.fileMap = generateFileMap(env.sourceDir, env.sidebar, {})

    env.vars = template.loadVars()
    env.parsers = await loadParsers(config, localRoot, internalRoot)

    env.file = new Proxy({}, {
        get(_, name) {
            return loadSourceFile(env, name)
        }
    })

    const render = (files) => {
        for (const info of files) {
            renderFile(template, env, info)
            render(info.sublist ?? [])
        }
    }
    const copyStatic = (source, dest) => {
        if (fs.exists(source) === false) {
            return
        }
        fs.copy(source, dest, { overwrite: true })
    }
    render(env.sidebar)
    console.log("Copying static files for template")
    template.copyStatic(env.destDir)
    console.log("Copying static files from .ipsen")
    copyStatic(
        path.resolve(localRoot, "static"),
        env.destDir
    )
}
