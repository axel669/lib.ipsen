import path from "node:path"
import url from "node:url"

import js from "./lib/parser/js.mjs"
import md from "./lib/parser/md.mjs"
import py from "./lib/parser/py.mjs"

const basic = path.resolve(
    path.dirname(
        url.fileURLToPath(import.meta.url)
    ),
    "lib/templates/basic"
)

export {
    js,
    md,
    py,
    basic,
}
