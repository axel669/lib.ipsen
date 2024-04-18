
const escape = (value) =>
    value?.toString()
    ?? ""
const str = []
str.push("<html>\n    <head>\n        <title>")
str.push(escape($.title))
str.push("</title>\n        <meta name=\"viewport\" content=\"initial-scale=1,maximum-scale=1,minimum-scale=1,width=device-width\" />\n\n        <link href=\"https://cdn.jsdelivr.net/npm/prismjs@v1.29.0/themes/prism${themeCSS[theme]}.css\" rel=\"stylesheet\" />\n    </head>\n\n    <body ws-x=\"theme[${theme}]\">\n        <script src=\"https://cdn.jsdelivr.net/npm/@axel669/windstorm@0.1.17/dist/browser.js\"></script>\n        <style>\n            input[type=checkbox]+ws-modal > [ws-x~=\"@menu\"] {\n                transition: transform var(--anim-time, 250ms) linear;\n                transform: translateX(-100%);\n            }\n            input[type=checkbox]:checked+ws-modal > [ws-x~=\"@menu\"] {\n                transform: translateX(0%);\n            }\n            input[type=checkbox]+ws-modal {\n                display: block !important;\n                transition: visibility var(--anim-time, 250ms) linear;\n                visibility: hidden;\n            }\n            input[type=checkbox]:checked+ws-modal {\n                visibility: visible;\n            }\n\n            /* a series of global css defines for the markdown rendering */\n            blockquote {\n                margin: 0px;\n                padding: 4px;\n                padding-left: 8px;\n            }\n            blockquote > p {\n                margin: 0px;\n                border-left: 4px solid var(--primary);\n                padding: 2px;\n                padding-left: 4px;\n            }\n            h1 {\n                border-bottom: 2px solid var(--primary);\n            }\n            ul {\n                padding-inline-start: 28px;\n            }\n            iframe {\n                width: 100%;\n                height: 250px;\n                border: 1px solid var(--primary);\n                border-radius: 4px;\n            }\n            pre {\n                overflow-x: auto;\n            }\n\n            h2 {\n                border-bottom: 1px solid var(--secondary);\n            }\n            h3 {\n                border-bottom: 1px solid var(--text-color-secondary);\n            }\n\n            td {\n                vertical-align: top;\n            }\n\n            /*  Add style for mermaid diagrams.\n                The background color for dark mode edges happens to be the same\n                as the dark mode background color for ws-paper.\n            */\n            .mermaid {\n                background-color: var(--background);\n            }\n        </style>\n        <ws-paper ws-x=\"r[0px] w[min(100%,800px)] m-l[auto] m-r[auto]\">\n            <div ws-x=\"pos[fixed] x[0px] y[0px] grid w[36px] h[40px]\">\n                <label ws-x=\"@button @flat $compact $color[primary] r[0px]\n                bg[&background-layer] b-s[solid] b-c[&primary]\n                b-r-w[2px] b-b-w[2px] r-br[4px]\" for=\"menu\">\n                    <ws-icon class=\"ti-menu-2\" ws-x=\"t-sz[20px]\" />\n                </label>\n            </div>\n            <ws-flex ws-x=\"over[auto] p-x[40px] p-y[0px]\" id=\"wrapper\">\n                ")
console.log("partial: sidebar.html")
str.push("\n                <div>\n                    ")
str.push($.content)
str.push("\n                </div>\n            </ws-flex>\n            ")
const __loop1 = Array.from($.data.items)
if (__loop1.length > 0) {
for (let __index1 = 0; __index1 < __loop1.length; __index1 += 1) {
const index = __index1
const item = __loop1[__index1]
str.push("\n                <div>")
str.push(escape(item.file))
str.push("</div>\n            ")
}
} else {
str.push("\n                <div>No Items</div>\n            ")
}
}
str.push("\n        </ws-paper>\n        <script type=\"module\">\n            import mermaid\n            from \"https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs\"\n\n            mermaid.run({})\n        </script>\n        <script src=\"https://cdn.jsdelivr.net/npm/prismjs@v1.29.0/components/prism-core.min.js\"></script>\n        <script src=\"https://cdn.jsdelivr.net/npm/prismjs@v1.29.0/plugins/autoloader/prism-autoloader.min.js\"></script>\n    </body>\n</html>\n")
return str.join("")
