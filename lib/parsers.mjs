const parsers = {
    ".svelte": {
        content: (source) => {
            const comments = [
                ...source.matchAll(/\/\*md(\r|\n)+(?<content>(.|\r|\n)*?)\*\//gm)
            ]
            const formatted =
                comments
                    .map(
                        m => {
                            const md = m.groups.content
                            const leadingIndent = md.match(/^\s*/)[0]
                            return md.replace(
                                new RegExp(`^${leadingIndent}`, "gm"),
                                ""
                            )
                        }
                    )
                    .join("\n")
                    .trim()
            return formatted
        },
        headers: (source) => {
            const location = source.match(/\/\/ \* @(.+)$/m)?.[1] ?? null
            const example = source.match(/\/\/ \* \$(.+)$/m)?.[1] ?? null

            return { location, example }
        }
    },
    ".md": {
        content: (source) => source,
        headers: () => ({ location: null, example: null })
    }
}
parsers[".mjs"] = parsers[".svelte"]
parsers[".js"] = parsers[".svelte"]
parsers[".cjs"] = parsers[".svelte"]

export default parsers
