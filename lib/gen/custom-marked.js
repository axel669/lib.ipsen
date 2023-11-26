import { Marked } from "marked"
import prism from "prismjs"
import loadLang from "prismjs/components/index.js"

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
                loadLang(lang)
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
                    return `<a href="${href.slice(0, -2)}html">${text}</a>`
                }
                return false
            }
        }
    })
    return custom
}

export default customMarked
