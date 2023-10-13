import fs from "fs-jetpack"
import path from "node:path"

export default (parsers, root) => {
    const data = {}
    const pattern = `**/*{${Object.keys(parsers)}}`
    const source = path.resolve(root, "data")
    // console.log(parsers)
    const files = fs.find(
        source,
        { matching: pattern }
    )
    for (const file of files) {
        const filename = path.resolve(file)
        const key = filename.slice(source.length + 1).replace(/\\/g, "/")
        const ext = path.extname(file)
        data[key] = parsers[ext](
            fs.read(filename)
        )
    }

    return data
}
