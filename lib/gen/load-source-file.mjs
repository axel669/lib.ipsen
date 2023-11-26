import fs from "fs-jetpack"
import path from "node:path"
import IpsenError from "../err.mjs"

export default (env, file) => {
    if (env.dataCache[file] !== undefined) {
        return env.dataCache[file]
    }
    console.log("loading:", file)
    const ext = path.extname(file)
    if (env.parsers[ext] === undefined) {
        throw new IpsenError(`No parser defined for ${ext} files`)
    }
    const source = fs.read(file)
    if (source === undefined) {
        throw new IpsenError(`could not read file: ${file}`)
    }
    const info = env.parsers[ext](source)
    env.dataCache[file] = info
    return info
}
