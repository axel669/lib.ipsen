import html from "./comp/html.mjs"
import Sidebar from "./comp/sidebar.mjs"

import parseMD from "./parser.mjs"
import styleFix from "./comp/style-fix.mjs"

const themeCSS = {
    light: "-coy",
    dark: "-twilight",
    tron: "-twilight",
}

export default ({ config, api, content, item, contentTree }) => {
    const { options = {} } = config
    const theme = options.theme ?? "dark"

    const [__html, headers] = parseMD(item.meta.__content, api)

    return html`
        <html>
            <head>
                <title>${item.meta.title ?? item.name}<//>
                <meta name="viewport" content="initial-scale=1,maximum-scale=1,minimum-scale=1,width=device-width" />

                <link href="https://cdn.jsdelivr.net/npm/prismjs@v1.29.0/themes/prism${themeCSS[theme]}.css" rel="stylesheet" />
            <//>
            <body ws-x="theme[${theme}]">
                <script src="https://cdn.jsdelivr.net/npm/@axel669/windstorm@0.1.17/dist/browser.js"></script>
                <style dangerouslySetInnerHTML=${styleFix}></style>
                <ws-paper ws-x="r[0px] w[min(100%,800px)] m-l[auto] m-r[auto]">
                    <div ws-x="pos[fixed] x[0px] y[0px] grid w[36px] h[40px]">
                        <label ws-x="@button @flat $compact $color[primary] r[0px]
                        bg[&background-layer] b-s[solid] b-c[&primary]
                        b-r-w[2px] b-b-w[2px] r-br[4px]" for="menu">
                            <ws-icon class="ti-menu-2" ws-x="t-sz[20px]" />
                        <//>
                    <//>
                    <ws-flex ws-x="over[auto] p-x[40px] p-y[0px]" id="wrapper">
                        <${Sidebar} ...${{ api, content, item, headers, contentTree }} />
                        <div dangerouslySetInnerHTML=${{ __html }}><//>
                    <//>
                <//>
                <script type="module" dangerouslySetInnerHTML=${{
                    __html: `
                        import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs";
                        mermaid.run({});
                    `
                }}></script>
                <script src="https://cdn.jsdelivr.net/npm/prismjs@v1.29.0/components/prism-core.min.js"></script>
	            <script src="https://cdn.jsdelivr.net/npm/prismjs@v1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
            <//>
        <//>
    `
}
