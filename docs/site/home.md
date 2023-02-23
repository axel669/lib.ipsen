# Ipsen

A library for turning markdown inside your comments into a nifty docs site.

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
    // Title to display on the title bar of the page
    title: "Ipsen Example",
    // The source folder to scan
    source: "src",
    // The output folder
    dest: "site",
    // Optional
    // A set of patterns to include in the file globbing.
    // The base set of patterns is
    // ["**\/*.{js,cjs,mjs,svelte,md}", "!**\/$*", "!**\/node_modules\/**\/*"]
    patterns: [],
    // Optional
    // If true, removes the dest dir before building. Useful for ensuring a
    // a clean build each time.
    clearDest: true,
}
```

### patterns `Optional`

A set of patterns to include/exclude in the file globbing. The base set of
patterns is
`["**\/*.{js,cjs,mjs,svelte,md}", "!**\/$*", "!**\/node_modules\/**\/*"]`