import { render } from "preact-render-to-string"

import page from "./page.mjs"

const renderPages = async ({config, info, destination}) => {
    const pages = Object.entries(info.content)
    for (const [sourceFile, item] of pages) {
        console.group(`processing: ${sourceFile}`)
        const destName = `${item.name}.html`

        console.log("rendering page")
        const output = render(
            page({ ...info, item, config })
        )
        console.log("writing", destName)
        await destination.write(destName, output)
        console.groupEnd()
    }
}

export default renderPages
