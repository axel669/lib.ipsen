export default {
    title: "Ipsen Documentation",
    source: "../lib",
    dest: "site",
    home: "main.md",
    patterns: [
        "!default-home.md"
    ],
    clearDest: true,
    readme: {
        source: "main.md",
        dest: ".."
    }
}
