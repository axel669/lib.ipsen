import fs from "fs-jetpack"
import path from "node:path"

const loadData = (env, file) => {
    if (env.dataCache[file] !== undefined) {
        return env.dataCache[file]
    }
    console.log("parsing:", file)
    const source = fs.read(file)
    if (source === undefined) {
        throw new Error(`could not read file: ${file}`)
    }
    const ext = path.extname(file)
    const info = env.parsers[ext](source)
    env.dataCache[file] = info
    return info
}

export default loadData
