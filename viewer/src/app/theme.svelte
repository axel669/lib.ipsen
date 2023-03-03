<script context="module">
    import {
        LightTheme,
        DarkTheme,
        TronTheme,
    } from "svelte-doric"
    import { writable, derived } from "svelte/store"

    const themeMap = {
        light: LightTheme,
        dark: DarkTheme,
        tron: TronTheme,
    }
    export const themeName = writable(
        localStorage.theme ?? window.siteConfig.defaultTheme
    )
    export const theme = derived(
        [themeName],
        ([name]) => themeMap[name]
    )

    themeName.subscribe(
        (name) => localStorage.theme = name
    )
</script>

<script>
    import {
        Titlebar,
        Tabs,
    } from "svelte-doric"

    const options = [
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
        { label: "Tron", value: "tron" },
    ]
</script>

<!-- <Titlebar>
    Theme
</Titlebar> -->
<Tabs {options} bind:tabGroup={$themeName} />
