import path from "node:path"

import { safeText } from "./safe-text.js"

const parseSidebarHref = (href, destPath) => {
    if (href === undefined) {
        return {
            file: undefined,
            template: null,
            destFile: null
        }
    }
    const [file, template = "page.html"] = href.split("#")
    const destFile = `${destPath}/${path.basename(file).slice(0, -3)}.html`
    return {
        file,
        template,
        destFile
    }
}

const transformTokens = (list, sitePath = ["."]) => {
    if (list === undefined) {
        return []
    }
    const items = list.items.filter(
        item => item.type === "list_item"
    )

    return items.map(
        item => {
            const text = item.tokens.find(tok => tok.type === "text")
            const name = text.tokens[0].text
            const destPath = sitePath.join("/")
            return {
                name,
                ...parseSidebarHref(text.tokens[0].href, destPath),
                sitePath,
                depth: sitePath.length - 1,
                sublist: transformTokens(
                    item.tokens.find(tok => tok.type === "list"),
                    [...sitePath, safeText(name)]
                ),
            }
        }
    )
}

export { parseSidebarHref }
export default transformTokens
