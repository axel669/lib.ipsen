export default {
    __html: `
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

            /* a series of global css defines for the markdown rendering */
            blockquote {
                margin: 0px;
                padding: 4px;
                padding-left: 8px;
            }
            blockquote > p {
                margin: 0px;
                border-left: 4px solid var(--primary);
                padding: 2px;
                padding-left: 4px;
            }
            h1 {
                border-bottom: 2px solid var(--primary);
            }
            ul {
                padding-inline-start: 28px;
            }
            iframe {
                width: 100%;
                height: 250px;
                border: 1px solid var(--primary);
                border-radius: 4px;
            }
            pre {
                overflow-x: auto;
            }

            h2 {
                border-bottom: 1px solid var(--text-color-secondary);
            }
    `
}
