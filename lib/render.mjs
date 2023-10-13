import fs from "fs-jetpack"
import path from "node:path"
import url from "node:url"
import yaml from "js-yaml"
import { marked } from "marked"

import compile, { renderComponent } from "./burger/compile.mjs"
import loadParsers from "./gen/load-parsers.mjs"
import loadDataFiles from "./gen/load-data-files.mjs"

import renderFile from "./gen/render-file.mjs"
import transformTokens from "./gen/transform-tokens.mjs"


export default async () => {
    const env = {}

    const localRoot = path.resolve(".ipsen")
    const internalRoot = path.resolve(
        path.dirname(
            url.fileURLToPath(import.meta.url)
        )
    )
    const config = yaml.load(
        fs.read(
            path.resolve(localRoot, "config.yml")
        )
    )
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
            file: index.tokens[0].href,
            destFile: "index.html",
            sublist: [],
        },
        ...transformTokens(fileSource)
    ]

    const templateDir =
        (config.template.startsWith("@") === true)
        ? path.resolve(internalRoot, "template", config.template.slice(1))
        : path.resolve(localRoot, "template", config.template)
    env.renderPage = compile(
        path.resolve(templateDir, "page.html")
    )
    env.render = (name, $) => renderComponent(templateDir, name, $)
    // env.templateDir = templateDir

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
    console.group("Rendering Content")
    render(
        { ...env, rendered: [], dataCache: {} },
        env.sidebar
    )
    console.groupEnd()
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
