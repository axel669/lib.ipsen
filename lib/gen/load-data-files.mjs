import fs from "fs-jetpack"
import path from "node:path"
import IpsenError from "../err.mjs"

export default (parsers, root) => {
    const data = {}
    const source = path.resolve(root, "data")

    return new Proxy(
        data,
        {
            get(_, file) {
                const key = path.resolve(source, file)
                if (data[key] !== undefined) {
                    return data[key]
                }
                const ext = path.extname(file)
                if (parsers[ext] === undefined) {
                    throw new IpsenError(`No parser defined for ${ext} files`)
                }

                const raw = fs.read(key)
                console.log(`loading data: ${key}`)
                if (raw === undefined) {
                    throw new IpsenError(`Unable to load ${file}`)
                }
                data[key] = parsers[ext](raw)
                return data[key]
            }
        }
    )
}
