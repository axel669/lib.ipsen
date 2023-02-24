<script>
    import {
        AppStyle,
        Baseline as baseline,
        TronTheme as theme,

        Screen,
        Paper,
        CircleSpinner as Spinner,
        Appbar,
        Button,
        Icon,

        drawer,
        hash,
    } from "svelte-doric"

    import Markdown from "./app/markdown.svelte"

    import Menu from "./menu.svelte"

    import page from "$/state/page"

    const {sidebar, title} = window.appInfo

    const showMenu = () => drawer.open(Menu, { content: sidebar })

    $: page.load($hash || "home")
</script>

<style>
    content-wrapper {
        display: block;
        width: min(100%, 640px);
        padding: 6px;
    }

    /* a series of global css defines for the markdown rendering */
    :global(blockquote) {
        margin: 0px;
        padding: 4px;
        padding-left: 8px;
    }
    :global(blockquote > p) {
        margin: 0px;
        border-left: 4px solid var(--primary);
        padding: 2px;
        padding-left: 4px;
    }
    :global(h1) {
        border-bottom: 2px solid var(--primary);
    }
    :global(ul) {
        padding-inline-start: 28px;
    }
</style>

<AppStyle {baseline} {theme} />

<Screen full>
    <Appbar slot="title">
        {title}

        <Button on:click={showMenu} adorn slot="menu">
            <Icon name="bars" />
        </Button>
    </Appbar>
    <Paper square lscrollable>
        <content-wrapper>
            {#if $page === null}
                Loading...
            {:else}
                <Markdown source={$page} />
            {/if}
        </content-wrapper>
        <!-- <pre>{$page ?? "loading..."}</pre> -->
    </Paper>
</Screen>
