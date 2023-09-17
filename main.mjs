// import { Parser, Rule } from "@axel669/proteus"
import yaml from "js-yaml"
import fs from "fs/promises"

const print = (item) => console.dir(item, { depth: null })

const typePreprocessor = (typeinfo) => {
    if (typeinfo === null || typeinfo === undefined) {
        return typeinfo
    }
    if (typeof typeinfo === "string") {
        if (typeinfo.startsWith("fn.") === true) {
            const [ type, ...meta] = typeinfo.split(".")
            return { type, meta }
        }
        return typeinfo
    }
    const pairs = Object.entries(typeinfo)
    return pairs.map(
        ([key, info]) => {
            const [name, type] = key.split("|")
            if (type === undefined) {
                const { "+desc": desc = "", ...props } = info
                return {
                    name,
                    desc,
                    props: typePreprocessor(props)
                }
            }
            if (info === null) {
                return { name, type, desc: "" }
            }
            if (typeof info === "string") {
                return { name, type, desc: info }
            }
            const { "+desc": desc, "+default": def } = info
            return { name, type, desc, def }
        }
    )
}
const nodePreprocessor = (node) => ({
    ...node,
    type: typePreprocessor(node.type),
    args: node.args?.map?.(typePreprocessor),
    return: typePreprocessor(node.return),
})

const input = await fs.readFile("test/first.mjs", "utf8")

const schema = yaml.DEFAULT_SCHEMA.extend([
    new yaml.Type(
        "!async",
        {
            kind: "mapping",
            construct(info) {
                return { async: true, ...info }
            }
        }
    ),
])
const parseCode = (file, code, parse) => {
    const parts = parse(code)
    return {
        file,
        content: parts.map(
            parsed => {
                const docs = parsed.docs.trim()
                const info = yaml.load(docs)
                return {
                    ...nodePreprocessor(info),
                    name: parsed.name,
                }
            }
        )
    }
}

print(
    parseCode("<string>", input, js)
    // jsCommentsParser.parse(input)
)
