import html from "./html.mjs"

export default ({ md, headers }) => html`
    <input type="checkbox" ws-x="hide" id="menu" />
    <ws-modal>
        <label for="menu"><//>
        <ws-paper ws-x="@menu r[0px] w[] w-min[20vw]">
            <ws-flex>
                ${headers.map(
                    (header, index) => html`
                        <a href="#h${index + 1}"
                        ws-x="p[8px] p-l[${header.depth * 16}px] t-sz[&text-size-header]
                        t-deco[none] hover:t-deco[underline]">
                            ${header.text}
                        <//>
                    `
                )}

                <ws-paper>
                ${Object.keys(md).map(
                    key => html`<div>${key}<//>`
                )}
                <//>
            <//>
        <//>
    <//>
`
