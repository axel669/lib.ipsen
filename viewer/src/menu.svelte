<script>
    import Item from "./menu/item.svelte"

    import page from "$/state/page"

    export let content
    export let close

    // const list = Object.entries(content)

    $: if ($page ===null) {
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
{#each content as item}
    <Item {item} />
{/each}
