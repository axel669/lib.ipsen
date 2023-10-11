const count = (() => {
    let i = 0
    return () => {
        i += 1
        return i
    }
})()
const lines = (...lines) => lines.join("\n")

export const Token = {
    raw: (text) => ({
        type: "raw",
        text,
        toString() { return `str.push(${JSON.stringify(text)})` }
    }),
    value: (expr) => ({
        type: "value",
        expr,
        toString() {
            return `str.push(escape(${expr}))`
        }
    }),
    html: (expr) => ({
        type: "html",
        expr,
        toString() {
            return `str.push(${expr})`
        }
    }),
    close: () => ({
        toString() {
            return "}"
        }
    }),
    partial: (text) => {
        const [name, options] = text.split("#").map(t => t.trim())
        const args = (options === undefined) ? "$" : `{...$, ${options}}`
        return {
            type: "partial",
            name,
            toString() {
                return `str.push(renderComponent(root, "${name}", ${args}))`
            }
        }
    },
}

export const controlNode = (source) => {
    if (source.startsWith("for ") === true) {
        const info = source.slice(4).match(
            /(?<source>.+?)\s+\->\s+(?<name>[\w\$_0-9]+)(,(?<index>[\w\$_0-9]+))?/
        )
        const loopvar = info.groups.source
        const name = info.groups.name
        const index = info.groups.index ?? "index"
        const i = count()

        const idx = `__index${i}`
        const lv = `__loop${i}`
        return {
            type: "for",
            loopvar, name, index,
            toString() {
                const init = `const ${lv} = Array.from(${loopvar})`
                const loop = lines(
                    `for (let ${idx} = 0; ${idx} < ${lv}.length; ${idx} += 1) {`,
                    `const ${index} = ${idx}`,
                    `const ${name} = ${lv}[${idx}]`,
                    ...this.tokens,
                )
                if (this.else.length === 0) {
                    return lines(init, loop)
                }
                return lines(
                    init,
                    `if (${lv}.length > 0) {`,
                    loop,
                    "}",
                    "} else {",
                    ...this.else,
                )
            }
        }
    }
    if (source.startsWith("if ") === true) {
        const condition = source.slice(3).trim()
        return {
            type: "if",
            toString() {
                const core = lines(
                    `if (${condition}) {`,
                    ...this.tokens,
                )
                if (this.else.length === 0) {
                    return core
                }
                return lines(
                    core,
                    "} else {",
                    ...this.else
                )
            }
        }
    }
    throw new Error("oops")
}
