import { js, md, py } from "../main.mjs"

export default {
    dir: "test",
    out: "site",
    parsers: [js, md, py],
    template: "#basic",
}
