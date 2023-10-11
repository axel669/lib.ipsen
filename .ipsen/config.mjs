import { js, py, yaml, json } from "../parsers.mjs"
import { entry } from "../lib/config-funcs.mjs"

export default {
    source: "test",
    index: {
        name: "Home",
        file: "readme.md"
    },
    parsers: [js, py, yaml, json],

    dest: "site",
    modifyTree: (tree) => {
        entry(tree, "py-stuff").name = "testing"
        // return tree
    },

    template: "#basic",
    options: {
        theme: "dark"
    },
}
