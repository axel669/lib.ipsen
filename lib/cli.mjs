#! /usr/bin/env node

import { parseArgs } from "node:util"

import { render, IpsenError } from "./main.mjs"

try {
    await render(
        parseArgs({
            options: {
                dev: {
                    type: "boolean",
                    default: false,
                    short: "d"
                }
            }
        }).values
    )
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
