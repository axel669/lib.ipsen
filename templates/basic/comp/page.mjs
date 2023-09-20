import html from "./html.mjs"
import Markdown from "./markdown.mjs"
import Sidebar from "./sidebar.mjs"

const styleFix = {__html: `
            input[type=checkbox]+ws-modal > [ws-x~="@menu"] {
                transition: transform var(--anim-time, 250ms) linear;
                transform: translateX(-100%);
            }
            input[type=checkbox]:checked+ws-modal > [ws-x~="@menu"] {
                transform: translateX(0%);
            }
            input[type=checkbox]+ws-modal {
                display: block !important;
                transition: visibility var(--anim-time, 250ms) linear;
                visibility: hidden;
            }
            input[type=checkbox]:checked+ws-modal {
                visibility: visible;
            }
    `
}

export default ({ config, mapping, item }) => {
    const api = item.find(ent => ent.ext !== ".md")
    const md = item.find(ent => ent.ext === ".md")

    return html`
        <html>
            <head>
                <title>Test?<//>
            <//>
            <body ws-x="@app theme[dark]">
                <script src="https://cdn.jsdelivr.net/npm/@axel669/windstorm@0.1.17/dist/browser.js"></script>
                <style dangerouslySetInnerHTML=${styleFix}></style>
                <ws-screen ws-x="&screen-width[100%]">
                    <ws-paper ws-x="r[0px]">
                        <ws-titlebar ws-x="@fill $color[primary]" slot="header">
                            <ws-text ws-x="$title" slot="title">
                                Test?
                            <//>

                            <label ws-x="@button @flat $compact" for="menu" slot="menu">
                                <ws-icon class="ti-menu-2" />
                            <//>
                        <//>
                        <ws-flex>
                            <${Sidebar} ...${{ mapping }} />
                            <${Markdown} ...${{ md, api }} />
                        <//>
                    <//>
                <//>
            <//>
        <//>
    `
}
