const parsers = {
    ".svelte": (source) => {
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
    ".sass": (source) => {
        const comments = [
            ...source.matchAll(/\/\*md(\r|\n)+(?<content>(^([ \t]+.+)?\r?\n)*)/gm)
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
    ".py": (source) => {
        const comments = [
            ...source.matchAll(/"""md(\r|\n)+(?<content>(.|\r|\n)*?)"""/gm)
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
    ".md": (source) => source,
}
parsers[".mjs"] = parsers[".svelte"]
parsers[".js"] = parsers[".svelte"]
parsers[".cjs"] = parsers[".svelte"]

export default parsers
