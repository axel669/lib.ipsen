import html from "./html.mjs"

export default ({ mapping }) => html`
    <input type="checkbox" ws-x="hide" id="menu" />
    <ws-modal>
        <label for="menu"><//>
        <ws-paper ws-x="@menu r[0px]">
            <ws-flex>
                ${Object.keys(mapping).map(
                    key => html`<div>${key}<//>`
                )}
            <//>
        <//>
    <//>
`
