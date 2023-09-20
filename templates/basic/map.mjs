const map = async (info) => info.reduce(
    (groups, entry) => {
        const key = entry.file.slice(0, -entry.ext.length)
        groups[key] = groups[key] ?? []
        groups[key].push(entry)
        return groups
    },
    {}
)

export default map
