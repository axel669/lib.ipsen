import fs from "fs-jetpack"
import compile from "./lib/burger/compile.mjs"

// const html = fs.read(".ipsen/template/page.html")

const print = (item) => console.dir(item, { depth: null })

const render = compile(".ipsen/template/page.html")
const _html = render({
    title: "testing",
    content: "<div>more divs!</div>",
    data: {
        items: [
            { file: "a" },
            { file: "b" },
            { file: "c2" },
            { file: "d4" },
        ]
    }
})
console.log(_html)
