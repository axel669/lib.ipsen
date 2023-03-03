import { writable } from "svelte/store"

const source = writable(null)

const { sidebarMap } = window.siteConfig
export default {
    subscribe: source.subscribe,
    load: async (next) => {
        source.set(null)
        const response = await fetch(`./docs/${sidebarMap[next]}`)
        const content = await response.text()
        source.set(content)
    }
}
