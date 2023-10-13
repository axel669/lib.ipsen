# Ipsen

A static site generator that aims to be simple and powerful.

## Installation
```bash
pnpm add @axel669/ipsen
```

## Usage
Ipsen uses a `.ipsen` folder in project root to determine configuration and
other things (see below).
```bash
ipsen
```

## .ipsen Folder
```
project
    .ipsen
        config.yml
        parser
        static
        template
            page.html
            vars.json
            static
            <other template files>
    <project files>
```
