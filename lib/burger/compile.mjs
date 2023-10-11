import fs from "fs-jetpack"
import path from "node:path"

import { Token, controlNode } from "./token.mjs"

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
            const prev = stack.pop()
            tokens = (prev.else.length > 0) ? prev.else : prev.tokens
            // tokens = stack[stack.length - 1].tokens
            tokens.push(Token.close())
            return
        }
        if (source.startsWith("@") === true) {
            tokens.push(
                Token.partial(
                    source.slice(1).trim()
                )
            )
            return
        }
        if (source.startsWith("*") === true) {
            tokens.push(
                Token.html(
                    source.slice(1).trim()
                )
            )
            return
        }
        if (source.startsWith("^") === true) {
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
        if (source.startsWith(":") === true) {
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
    '"': "&quote;",
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
    const component = compile(loc)
    componentCache[loc] = component
    return component($)
}
const compile = (file) => {
    const source = fs.read(file)
    // console.log("compiling:", file)
    const tokens = tokenize(source)
    const code = `
        return ($) => {
            const str = []
            ${tokens.join("\n")}
            return str.join("")
        }
    `
    // console.log(code)
    const wrap = new Function("escape", "renderComponent", "root", code)
    // console.log(wrap.toString())
    return wrap(escape, renderComponent, path.dirname(file))
}
export default compile
