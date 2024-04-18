import yml from "js-yaml"

export default code => yml.load(code)
// export default {
//     parse: code => yml.load(code),
//     extensions: ["yml", "yaml"],
// }
