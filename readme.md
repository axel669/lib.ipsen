# Ipsen

A static site generator that aims to be simple and powerful.

> ⚠ this documentation is very limited while more testing is going on.
> More comprehensive documentation will be available when Ipsen is closer to
> a production release.

## Installation
```bash
pnpm add @axel669/ipsen
```

## Usage
Ipsen uses a `.ipsen` folder in project root to determine configuration and
other things (see below).
```bash
npx ipsen
```
Or in `package.json`
```json
{
  ...,
  "scripts": {
    "render-docs": "ipsen"
  },
  ...
}
```
That's really it. All the configuration and custom files are read from the
`.ipsen` folder.

## .ipsen Folder
The `config.yml` file is the only file required by ipsen. The other folders are
optional, and only used when rendering from custom templates/parsers.

If the data folder is present, the files will be loaded from it using the
parsers configured in the config and loaded into `$.data[<filename>]` for the
templates to use.
```
project
    .ipsen
        config.yml
        parser
        static
        template
            code.html
            page.html
            vars.json
            static
            &lt;other template files>
    &lt;project files>
```

### config.yml
```yml
# The source markdown file that lists the contents of the site.
source: site.md
# The folder to save the generated files into.
dest: site
# Custom parsers for loading data out of files and into marked areas to make api
# documentation easier, and allowing the api docs to stay in the code files.
# Parsers starting with "@" will be loaded from the parsers available in Ipsen.
# Each extension needs to be configured individually even if they use the same
# parser.
parsers:
  mjs: "@js"
  js: "@js"
  cjs: "@js"
  py: "@py"
  yaml: "@yaml"
  json: "@json"
# The name of the template to use for generating the site. Names starting with
# "@" will resolve to the templates provided by ipsen, any other name will be
# resolved in the .ipsen/template folder in the project.
# The template will always load the page.html file from the template folder and
# use it to render the pages of the site.
template: "@basic"
# extra options available to the template as $.options. Any type of value allowed.
options:
  theme: dark
```

> The `.ipsen` folder and the `source`/`dest` options of the config are relative
> to the cwd where Ipsen is being run.

### source (site.md)
The source file should be a markdown file and list the contents of the site that
need to be rendered. It will also serve to build the sidebar menu for site
navigation. Links will determine which files are rendered (and their titles),
and text can be used to name any section of files in the list without rendering
content at that point.

Only one link should be outside of a list, and it will be used as the index
file for the site. All files except the index will generate an html file of the
same name with the extension changed. The index file will always be saved as
`index.html` to allow standard website configurations to play nice with the
rendered content.

The link targets can optionally have a hash that says which file within the
template should be used to render the page, defaults to `page.html`.

```md
[Home](readme.md)

- Python Stuff
    - [Test](py-stuff/test.md#thing.html)
```

> Currently Ipsen assumes the static site will be at the root of the domain
> it's hosted at, so all paths are `/<file>` within the html to make sure that
> any file can link to any othe file without needing to calculate the relative
> path between every file and every other file in the output.

### Parsers
Need something here for docs.

### Static Folder
If there is a static folder in the `.ipsen` folder, the files will be
copied to the output directory when the site is rendered.

## Template Folder
The template folder within the `.ipsen` folder can have a number of files that
will be used by the Burger Template engine within ipsen to generate the pages
for the static site. Ipsen also has a `@basic` template available that can be
used, or copied and modified for further customization.

Details for the Buger Template syntax can be found in the page about the
templates accesible from the sidebar menu.

### page.html
The default file that ipsen will look for when rendering a page.

### code.html
When a code block is rendered, Ipsen will look for this file in the template
and use it to render the syntax highlighted html for the code. The basic
template uses this file to add a copy button to quickly copy code. If this
file is not found, Ipsen will just render the highlighted code with no extra
controls or other modifications.

### vars.json
A json file that can have any number of variables available to templates as
`$.vars`. Ipsen does not read the contents of this file for anything it does on
its own, so it can have any format the template wants.
