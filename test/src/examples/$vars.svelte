<script>
    import vars from "svelte-doric"

    export let width
    export let height
    export let background

    $: cssVariables = {
        // force pixel units
        width: [width, "px"],
        height: [height, "px"],
        // copy as is
        background,
    }
</script>

<div use:vars={cssVariables} />
