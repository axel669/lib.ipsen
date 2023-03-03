export default {
    title: "Ipsen Demo",
    source: {
        dir: "src",
        readme: "vars.mjs",
        patterns: [
            "!examples/*",
            "!frames/*",
        ],
    },
    dest: {
        clear: true,
        dir: "site",
        readme: ".",
    },
    site: {
        index: "form.svelte",
        defaultTheme: "dark",
    },
    examples: "src/examples",
    frames: "src/frames",
    sidebar: {
        "python": 1,
        "Actions/intro": 0xfff01
    }
}
