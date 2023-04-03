#!/usr/bin/env node

/*md
[@] Home
# Ipsen

A library for turning markdown inside your comments into a nifty docs site.

## Installation
```bash
pnpm add @axel669/ipsen
```

## Usage
```bash
ipsen
ipsen config.file.mjs
```

## Config File
> if no config file is specified, it will default to `"ipsen.config.mjs"`

```js
// Example config
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
```

- ### title
    The title for the page to show in the title bar at the top.

- ### source
    - #### dir
        The directory to scan source files in.
    - #### readme `Optional`
        If present, will use the markdown from the specified source file as a
        readme.md file. Path is relative to the `source.dir` config option.
    - #### patterns `Optional`
        A set of patterns to include/exclude in the file globbing.
        The base set of patterns is
        `["**\/*.{supported extensions}", "!**\/$*", "!**\/node_modules\/**\/*"]`
        where the supported extensions is the all the configured languages Ipsen
        knows how to scan. Default extensions: js, cjs, mjs, svelte, md, py,
        sass.
- ### dest
    - #### dir
        The directory to output all of the files that are generated by Ipsen.
    - #### readme `Optional`
        The folder to output the readme file into (if defined in the source).
        Path is relative to the `dest.dir` config option.
    - #### clear `Optional`
        If `true`, will clear the directory specified in `dir` before generating
        new files.

- ### site
    - #### index `Optional`
        Specifies a file to use as the first page seen when the docs site is
        opened. Path is relative to the `source.dir` config option. If none is
        given, Ipsen will generate a very basic one and use it.
    - #### defaultTheme `Optional`
        Specifies a default theme to use for the website. Default is `"light"`,
        supported themes are `"light"`, `"dark"`, `"tron"`.

- ### examples `Optional`
    The directory to pull code examples from in the shorthand markdown.

- ### frames `Optional`
    The directory to pull iframe examples from in the shorthand markdown. The
    entire folder so examples that need to load other files can do so, as long
    as all the files are kept in the folder.

- ### sidebar `Optional`
    Object to customize the sort order of sidebar items. Each key should be the
    sidebar path (either the file location relative to `source.dir` or one given
    in the file) and the value should be a number. Numbers < `0xFFF00` will be
    sorted above other items in their section while numbers above that will be
    sorted below other items. Items with the same number defined will be sorted
    amongst their group using natural sort.
*/

const steps = [
    await import("./steps/load-files.mjs"),
    await import("./steps/check-sidebar.mjs"),
    await import("./steps/clean-dir.mjs"),
    await import("./steps/save-docs.mjs"),
    await import("./steps/save-readme.mjs"),
    await import("./steps/generate-content.mjs"),
]

let value = null
for (const step of steps) {
    const func = step.default
    value = await func(value)
}
