export default {
    title: "Ipsen Documentation",
    source: {
        dir: "../lib",
        readme: "main.mjs",
        patterns: [
            "!default-home.html"
        ],
    },
    dest: {
        dir: "site",
        clear: true,
        readme: "../..",
    },
    site: {
        defaultTheme: "dark",
        index: "main.mjs"
    },
    examples: "examples"
}
