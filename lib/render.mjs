import fs from "fs-jetpack"
import path from "node:path"
import url from "node:url"
import yaml from "js-yaml"
import { marked } from "marked"

import compile, { renderComponent } from "./burger/compile.mjs"
import loadParsers from "./gen/load-parsers.mjs"
import loadDataFiles from "./gen/load-data-files.mjs"

import renderFile from "./gen/render-file.mjs"
import transformTokens, { parseSidebarHref } from "./gen/transform-tokens.mjs"

import IpsenError from "./err.mjs"


export default async () => {
    const env = {}

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

    const sourceFile = path.resolve(config.source)
    env.sourceDir = path.dirname(sourceFile)
    env.destDir = path.resolve(config.dest)

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
            ...parseSidebarHref(index.tokens[0].href),
            // file: index.tokens[0].href,
            destFile: "index.html",
            sublist: [],
        },
        ...transformTokens(fileSource)
    ]

    const templateDir =
        (config.template.startsWith("@") === true)
        ? path.resolve(internalRoot, "template", config.template.slice(1))
        : path.resolve(localRoot, "template", config.template)
    env.render = (name, $) => renderComponent(templateDir, name, $)

    env.vars = fs.read(
        path.resolve(templateDir, "vars.json"),
        "json"
    ) ?? {}
    env.parsers = await loadParsers(config, localRoot, internalRoot)

    env.data = loadDataFiles(env.parsers, localRoot)

    const render = (env, files) => {
        for (const info of files) {
            renderFile(env, info)
            render(env, info.sublist ?? [])
        }
    }
    const copyStatic = (source, dest) => {
        if (fs.exists(source) === false) {
            return
        }
        fs.copy(source, dest, { overwrite: true })
    }
    render(
        { ...env, rendered: [], dataCache: {} },
        env.sidebar
    )
    console.log("Copying static files for template")
    copyStatic(
        path.resolve(templateDir, "static"),
        env.destDir
    )
    console.log("Copying static files from .ipsen")
    copyStatic(
        path.resolve(localRoot, "static"),
        env.destDir
    )
}