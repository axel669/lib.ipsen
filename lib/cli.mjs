#! /usr/bin/env node

import { render, IpsenError } from "./main.mjs"

try {
    await render()
}
catch (error) {
    console.log("")
    console.log("Site generation failed:")
    if (error instanceof IpsenError) {
        console.log(error.message)
        process.exit(1)
    }
    console.error(error)
}
