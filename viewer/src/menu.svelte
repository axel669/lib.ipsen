<script>
    import {
        Titlebar,
    } from "svelte-doric"

    import Theme from "./app/theme.svelte"
    import Item from "./menu/item.svelte"

    import page from "$/state/page"

    export let content
    export let close

    $: if ($page === null) {
        close()
    }
</script>

<style>
    size-elem {
        display: block;
        width: min(240px, 80vw);
    }
</style>

<size-elem />
<!-- <Theme /> -->
<Titlebar>
    Docs
</Titlebar>
{#each content as item}
    <Item {item} />
{/each}
