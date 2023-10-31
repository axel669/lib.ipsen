# Burger Templates

Burger Templates are a template system made for Ipsen (maybe one day it'll
become its own thing) for rendering different kinds of content with a simple
but powerful template engine. Templates can be of any file type because BT
processes them as strings regardless of file type (file type is mostly for
syntax highlighting in editors), but it does have some utility around rendering
html as that is what ipsen is targetting.

Every template has access to the normal node globals, and the `$` variable
which has all of the arguments passed into the template. Ipsen will pass the
following arguments to be accessed as `$.<name>`:
- **title**

    The title of the current page being rendered
- **content**

    The markdown from the source md file
- **vars**

    The template variables (if any)
- **options**

    The options from the `config.options` entry
- **sidebar**

    The list of items that appear in the sidebar.
    ```js
    {
        // The text shown on screen for the item
        name,
        // The markdown file that will be used as the source for the content
        file,
        // The template file that should be used to render the page
        template,
        // The output file name
        destFile,
        // Any items that appear in a list as sub items
        sublist,
    }
    ```
- **data**

    Access to any data files that are in the `.ipsen/data` directory.
    `$.data["filename"]`
- **headings**

    The list of headings in the current file.
    ```js
    {
        // The unique ID of the heading (used to generate the links)
        id,
        // The depth of the heading
        depth
    }
    ```

## Escaped Value
```html
<div>
    {| js expr |}
</div>
```

The basic syntax for inserting text can take any JS expression and will
render the result, applying html escaping of characters.

## Unescaped Value
```html
<div>
    {|* js expr |}
</div>
```

Render the result of the JS expression without applying any html
escaping.

## Markdown Render
```html
<div>
    {|md js expr |}
</div>
```

Treat the result of the JS expression as a markdown string, convert it to html
via `marked`, and render the html unescaped.

## Render Component
```html
<div>
    {|@ component.file |}
</div>
{|@ component.file # args |}
```

Renders a component by loading the file specified (paths are relative to the
current template file) and passing in the arguments for the current template
plus any arguments specified as key/value pairs (`key: value`). Does not html
escape the rendered content of the template file.

## If/Else
```html
{| if condition1 |}
    <div>No else here</div>
{||}

{|^ if condition2 |}
    <div>Stuff</div>
{|: else |}
    <span>other stuff</span>
{||}
```

Evaluates the condition (any valid JS if condition) and renders the text if the
condition is true, or renders the content of else when it is defined.

## For/Else
```html
{|^ for iterable -> name[, index] |}
    <div>#{| index + 1 |} - {| name |}</div>
{||}

{|^ for iterable -> name[, index] |}
    <div>{| name |}</div>
{:else}
    <span>No items</span>
{||}
```

Loops over an iterable object and renders content for each item. Iterable
objects are any object that has a `.length` property and items accessed like
array elements. Does not support destructuring the loop variable (yet?), but
a named index can be specified.

If there are no items in the iterable, and the `else` block is specified, the
content of the `else` block will be rendered.
