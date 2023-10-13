const transformTokens = (list) => {
    if (list === undefined) {
        return []
    }
    const items = list.items.filter(
        item => item.type === "list_item"
    )

    return items.map(
        item => {
            const text = item.tokens.find(tok => tok.type === "text")
            return {
                name: text.tokens[0].text,
                file: text.tokens[0].href,
                destFile: `${text.tokens[0].href?.slice(0, -3) ?? ""}.html`,
                sublist: transformTokens(
                    item.tokens.find(tok => tok.type === "list")
                ),
            }
        }
    )
}

export default transformTokens
