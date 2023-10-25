import fs from "fs-jetpack"
import path from "node:path"
import url from "node:url"
import yaml from "js-yaml"
import { Marked } from "marked"
import prism from "prismjs"
import loadLang from "prismjs/components/index.js"

import { renderComponent } from "./burger/compile.mjs"
import loadParsers from "./gen/load-parsers.mjs"
import loadDataFiles from "./gen/load-data-files.mjs"

import renderFile from "./gen/render-file.mjs"
import transformTokens, { parseSidebarHref } from "./gen/transform-tokens.mjs"

import IpsenError from "./err.mjs"

const uniq = (() => {
    let counter = 0
    return () => {
        counter += 1
        return counter
    }
})()

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

    const marked = new Marked()
    marked.use({
        renderer: {
            code(code, lang) {
                if (lang === "mermaid") {
                    return `<pre class="mermaid">${code}</pre>`
                }
                lang = (lang === "mermaid.code") ? "mermaid" : lang
                loadLang(lang)
                const converted = prism.highlight(
                    code,
                    prism.languages[lang],
                    lang
                )
                const codeTemplate = path.resolve(env.templateRoot, "code.html")
                if (fs.exists(codeTemplate) ===  false) {
                    return `<pre class="language-${lang}"><code class="language-${lang}">${converted}</code></pre>`
                }
                return env.render(
                    "code.html",
                    { code, converted, lang, id: uniq() }
                )
            }
        }
    })
    env.marked = marked

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
            destFile: "index.html",
            sublist: [],
        },
        ...transformTokens(fileSource)
    ]

    const internalTemplateRoot = path.resolve(
        internalRoot,
        "template",
        config.template.slice(1)
    )
    const localTemplateRoot = path.resolve(localRoot, "template", config.template)
    env.internalTemplateRoot = internalTemplateRoot
    env.localTemplateRoot = localTemplateRoot

    const templateDir =
        (config.template.startsWith("@") === true)
        ? internalTemplateRoot
        : localTemplateRoot
    env.templateRoot = templateDir
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
