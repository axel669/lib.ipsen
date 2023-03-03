<script>
    import { onMount } from "svelte"

    export let html

    let displayContainer = null
    onMount(
        () => {
            const codez = displayContainer.querySelectorAll("pre")
            for (const code of codez) {
                hljs.highlightElement(code)
            }
            const anchors = displayContainer.querySelectorAll("a")
            for (const anchor of anchors) {
                anchor.target = "_blank"
            }
        }
    )
</script>

<div bind:this={displayContainer}>
    {@html html}
</div>
