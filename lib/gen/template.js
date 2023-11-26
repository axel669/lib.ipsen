import fs from "fs-jetpack"
import path from "node:path"

import compile from "../burger/compile.mjs"
import IpsenError from "../err.mjs"

const listTemplatePaths = (name, location) => {
    const entry =
        (name.startsWith("@") === true)
            ? path.resolve(location.internal, name.slice(1))
            : path.resolve(location.local, name)
    const extend = fs.read(
        path.resolve(entry, ".extend")
    )?.trim()
    if (extend !== undefined) {
        return [entry, ...listTemplatePaths(extend, location)]
    }
    return [entry]
}

const template = ({ location, templateName }) => {
    const componentCache = {}
    const dirs = listTemplatePaths(templateName, location)

    const staticDirs =
        dirs
        .map(dir => path.resolve(dir, "static"))
        .filter(dir => fs.exists(dir) === "dir")

    const sourceFiles = {}
    for (const dir of dirs) {
        const folder = fs.cwd(dir)

        const filelist = folder.find({
            matching: [
                "!.extend",
                "!static/*",
                "!vars.json",
                "**/*"
            ]
        })
        for (const file of filelist) {
            sourceFiles[file.replace(/\\/g, "/")] = folder.path(file)
        }
    }

    const render = (name, $) => {
        if (sourceFiles[name] === undefined) {
            throw new IpsenError(`No component file: ${name}`)
        }
        if (componentCache[name] !== undefined) {
            return componentCache[name]($)
        }
        const component = compile(sourceFiles[name], name, render)
        componentCache[name] = component
        return component($)
    }

    return {
        render,
        has(name) {
            return sourceFiles[name] !== undefined
        },
        copyStatic(destDir) {
            for (const dir of staticDirs) {
                fs.copy(dir, destDir, { overwrite: true })
            }
        },
        loadVars: () => dirs.reduceRight(
            (vars, dir) => {
                const localVars = fs.read(
                    path.resolve(dir, "vars.json"),
                    "json"
                )
                if (localVars === undefined) {
                    return vars
                }
                return { ...vars, ...localVars }
            },
            {}
        )
    }
}

export default template
