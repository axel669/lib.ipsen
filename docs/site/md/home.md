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
> if no config file is given, it will default to `"ipsen.config.mjs"`

```js
// default export contains all the config options
export default {
    clearDest: true,
    title: "Ipsen Example",
    source: "src",
    dest: "site",
    home: "main.md",
    patterns: [],
    readme: {
        dest: ".",
        source: "intro.md"
    }
}
```

- ### clearDest `Optional`
    If `true`, removes the dest dir before building.  
    Useful for ensuring a clean build each time.

- ### dest
    The name of the folder to output all the static files into.

- ### home `Optional`
    The name of a file to use as the landing page for the documentation site.
    If one is not specified, a generic home file will be used.

- ### patterns `Optional`
    A set of patterns to include/exclude in the file globbing. The base set of
    patterns is
    `["**\/*.{js,cjs,mjs,svelte,md}", "!**\/$*", "!**\/node_modules\/**\/*"]`

- ### readme `Optional`
    If present, Ipsen will copy a file into readme.md (so you can write docs
    that will be vewiable in places like npm or repos).
    - ### readme.dest
        The output directory for a readme.md file to be saved.

    - ### readme.source
        The file to copy as the readme. Uses the names of the output files (ex
        `home.md`, `misc/func.md`)

- ### source
    The source folder to scan for markdown comments.

- ### title
    Title to display in the title bar of the page.