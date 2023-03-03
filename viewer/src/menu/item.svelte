<script context="module">
    const openState = new Map()
</script>

<script>
    import {
        Button,
        Paper,
    } from "svelte-doric"

    import page from "$/state/page"

    export let item
    const { label, items } = item

    const terminal = Array.isArray(items) === false

    const navigate = (next) =>
        () => location.hash = next

    let open = openState.get(items) ?? false

    $: openState.set(items, open)
</script>

<style>
    menu-node {
        display: flex;
        flex-direction: column;
    }
    div {
        width: 100%;
    }
    details {
        padding: 4px 0px 4px 8px;
    }
    summary {
        user-select: none;
        padding: 4px 0px;
        border-bottom: 1px solid var(--primary);
        cursor: pointer;
    }
    not-summary {
        display: block;
        padding: 4px;
        padding-right: 0px;
    }
</style>

<menu-node class:terminal>
    {#if terminal === true}
        <Button on:click={navigate(items)} square compact>
            <div>{label}</div>
        </Button>
    {:else}
        <details bind:open>
            <summary>{label}</summary>
            {#each items as item}
                <not-summary>
                    <svelte:self {item} />
                </not-summary>
            {/each}
        </details>
    {/if}
</menu-node>
