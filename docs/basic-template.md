# Basic Template

The basic template is built for documentation sites with multiple pages (but it
will work just fine for a single page). Its designed to look good on both mobile
and desktop size screens, and uses a single-column layout for the content.

## Options

### theme
Sets the theme to use to render the page. Accepts `light`, `dark`, and `tron`.

### repo
If given, will include a link button in the upper-right of the content that goes
to the repo link.

### favicon
Will generate favicon link element if the favicon does not use the `favicon.ico`
file name.

### opengraph
> Still very beta (limited support)

Allows some OpenGraph tags to be generated on the output pages for link
previews. All opengraph properties are optional.

- **title** - The title to show in link previews
- **description** - The description that shows under the link title
- **image** - The image to show next to the title/description
- **themeColor** - Adds some color to link previews where supported
