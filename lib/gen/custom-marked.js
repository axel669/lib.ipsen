import path from "node:path"

import { Marked } from "marked"
import prism from "prismjs"
import loadLang from "prismjs/components/index.js"

const loadLanguage = (name) => {
    if (prism.languages[name] !== undefined) {
        return
    }
    loadLang(name)
}

const customMarked = (template) => {
    let uniqCounter = 0
    const uniq = () => {
        uniqCounter += 1
        return uniqCounter
    }

    const custom = new Marked()
    custom.use({
        renderer: {
            code(code, lang) {
                if (lang === "mermaid") {
                    return `<pre class="mermaid">${code}</pre>`
                }
                if (lang === "") {
                    return `<pre><code>${code}</code></pre>`
                }
                lang = (lang === "mermaid.code") ? "mermaid" : lang
                loadLanguage(lang)
                const converted = prism.highlight(
                    code,
                    prism.languages[lang],
                    lang
                )
                if (template.has("code.html") === false) {
                    const lines = [
                        `<pre class="language-${lang}">`,
                        `<code class="language-${lang}">`,
                        converted,
                        "</code>",
                        "</pre>"
                    ]
                    return lines.join("")
                }
                return template.render(
                    "code.html",
                    { code, converted, lang, id: uniq() }
                )
            },
            link(href, _, text) {
                const shouldRewrite = (
                    (
                        href.startsWith("./") === true
                        || href.startsWith("../") == true
                    )
                    && href.endsWith(".md") === true
                )
                if (shouldRewrite === true) {
                    const target = path.resolve(
                        path.dirname(custom.$meta.file),
                        href
                    )
                    return `<a href="${custom.$meta.fileMap[target]}">${text}</a>`
                }
                return false
            }
        }
    })
    return custom
}

export default customMarked
