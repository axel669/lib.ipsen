import { js, md, py, basic } from "../main.mjs"

// import js from "../src/parser/js.mjs"
// import md from "../src/parser/md.mjs"
// import py from "../src/parser/py.mjs"

// // import page from "../templates/basic/page.mjs"

export default {
    dir: "test",
    out: "site",
    parsers: [js, md, py],
    template: basic,
}
