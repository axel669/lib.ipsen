export default (contents) => {
    const groups = contents.reduce(
        (groups, [file, info]) => {
            if (info === null) {
                return groups
            }
            groups[info.sidebar] = [
                ...(groups[info.sidebar] ?? []),
                file
            ]
            return groups
        },
        {}
    )
    const invalid =
        Object.entries(groups)
        .filter(
            (entry) => entry[1].length > 1
        )

    if (invalid.length === 0) {
        return contents
    }

    console.group("Multiple files mapped to same sidebar entry")
    for (const [sidebar, files] of invalid) {
        console.group(sidebar)
        for (const file of files) {
            console.log(file)
        }
        console.groupEnd()
    }
    console.groupEnd()
    process.exit(1)
}
