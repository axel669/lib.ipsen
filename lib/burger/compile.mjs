import fs from "fs-jetpack"
import path from "node:path"
import { marked } from "marked"

import { Token, controlNode } from "./token.mjs"
import IpsenError from "../err.mjs"

const trimPrev = (tokens) => {
    const prevToken = tokens[tokens.length - 1]
    prevToken.text = prevToken.text?.replace(/\r?\n[ \t]*$/, "")
}
const tokenize = (source) => {
    let pos = 0

    const stack = [{ tokens: [] }]
    let tokens = stack[0].tokens

    const processToken = (source) => {
        if (source === "") {
            if (stack.length === 1) {
                throw new Error("Unexpected close token")
            }
            // stack.pop()
            trimPrev(tokens)
            const prev = stack.pop()
            tokens = (prev.else.length > 0) ? prev.else : prev.tokens
            tokens.push(Token.close())
            return
        }
        if (source.startsWith("md ") === true) {
            tokens.push(
                Token.markdown(
                    source.slice(3)
                )
            )
            return
        }
        if (source.startsWith("@ ") === true) {
            tokens.push(
                Token.partial(
                    source.slice(1).trim()
                )
            )
            return
        }
        if (source.startsWith("* ") === true) {
            tokens.push(
                Token.html(
                    source.slice(1).trim()
                )
            )
            return
        }
        if (source.startsWith("^ ") === true) {
            trimPrev(tokens)
            const node = {
                ...controlNode(
                    source.slice(1).trim()
                ),
                tokens: [],
                else: []
            }
            tokens.push(node)
            stack.push(node)
            tokens = node.tokens
            return
        }
        if (source.startsWith(": ") === true) {
            tokens = stack[stack.length - 1].else
            return
        }
        tokens.push(
            Token.value(
                source.trim()
            )
        )
    }

    while (true) {
        const next = source.indexOf("{|", pos)
        if (next === -1) {
            tokens.push(
                Token.raw(
                    source.slice(pos)
                )
            )
            if (stack.length > 1) {
                throw new Error("unclosed control structure in template")
            }
            return stack[0].tokens
        }
        tokens.push(
            Token.raw(
                source.substring(pos, next)
            )
        )
        const tokenSource = source.substring(
            next,
            source.indexOf("|}", next) + 2
        )
        pos = next + tokenSource.length
        processToken(
            tokenSource.slice(2, -2)
        )
    }
}

const replacers = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
}
const escape = (value) =>
    value?.toString().replace(/[\&<>"]/g, (s) => replacers[s])
    ?? ""
const componentCache = {}
const renderComponent = (root, name, $) => {
    const loc = path.resolve(root, name)
    if (componentCache[loc] !== undefined) {
        return componentCache[loc]($)
    }
    const component = compile(name, loc)
    componentCache[loc] = component
    return component($)
}
const compile = (name, file) => {
    const source = fs.read(file)
    if (source === undefined) {
        throw new IpsenError(`Unable to load component ${name} (${file})`)
    }
    const tokens = tokenize(source)
    const extra = {
        escape,
        renderComponent,
        root: path.dirname(file),
        renderMarkdown: marked.parse,
    }
    const code = `
        const { ${Object.keys(extra).join(", ")} } = __extras
        return ($) => {
            const str = []
            ${tokens.join("\n")}
            return str.join("")
        }
    `
    const wrap = new Function("__extras", code)
    return wrap(extra)
}
export { renderComponent }
export default compile
