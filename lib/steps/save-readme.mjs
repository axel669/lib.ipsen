import fs from "fs-jetpack"

import config from "#config"

export default (contents) => {
    if (config.file.source.readme === undefined) {
        return contents
    }

    const readmeFile = contents.find(
        (entry) => entry[0] === config.file.source.readme
    )

    if (readmeFile === undefined) {
        console.log(`${config.file.source.readme} not found in files.`)
        return contents
    }

    fs.write(
        config.resolve.dest(config.file.dest.readme, "readme.md"),
        readmeFile[1].md.replace(/^\[\^\] (?<url>.+)$/gm, "")
    )

    return contents
}
