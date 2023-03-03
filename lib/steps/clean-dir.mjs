import fs from "fs-jetpack"

import config from "#config"

export default (contents) => {
    if (config.file.dest.clear !== true) {
        return contents
    }

    console.log("Cleaning destination folder")
    fs.remove(
        config.dir.dest
    )
    return contents
}
