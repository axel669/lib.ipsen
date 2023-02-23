<script context="module">
    const openState = new Map()
</script>

<script>
    import {
        Button,
        Paper,
    } from "svelte-doric"

    import page from "$/state/page"

    export let section = null
    export let content

    const terminal = typeof content === "string"

    const navigate = (next) =>
        () => location.hash = next
        // () => page.load(next)

    let open = openState.get(content) ?? false

    const list = Object.entries(content)

    $: openState.set(content, open)
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
        <Button on:click={navigate(content)} square compact>
            <div>{section}</div>
        </Button>
    {:else}
        {#each list as [title, content]}
            <details bind:open>
                <summary>{section}</summary>
                <not-summary>
                    <svelte:self section={title} {content} />
                </not-summary>
            </details>
        {/each}
    {/if}
</menu-node>
