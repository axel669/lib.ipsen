import { writable } from "svelte/store"

const source = writable(null)

export default {
    subscribe: source.subscribe,
    load: async (next) => {
        source.set(null)
        const response = await fetch(`md/${next}.md`)
        const content = await response.text()
        source.set(content)
    }
}
