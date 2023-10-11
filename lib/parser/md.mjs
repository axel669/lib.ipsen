import fm from "yaml-front-matter"

export default {
    parse: code => fm.loadFront(code),
    type: "content",
    extensions: ["md"]
}
