<script>
    import { onMount } from "svelte"
    import Markdown from "svelte-markdown"

    import Code from "./markdown/code.svelte"

    export let source

    const renderers = {
        code: Code,
    }

    let markdownContainer = null
    onMount(
        () => {
            const codez = markdownContainer.querySelectorAll("pre")
            for (const code of codez) {
                hljs.highlightBlock(code)
            }
            const anchors = markdownContainer.querySelectorAll("a")
            for (const anchor of anchors) {
                anchor.target = "_blank"
            }
        }
    )
</script>

<div bind:this={markdownContainer}>
    <Markdown {source} {renderers} />
</div>
