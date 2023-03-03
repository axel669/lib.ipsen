<script>
    import {
        AppStyle,
        Baseline as baseline,

        Screen,
        Paper,
        CircleSpinner as Spinner,
        Appbar,
        Button,
        Icon,

        drawer,
        hash,
    } from "svelte-doric"

    import Theme, { theme } from "./app/theme.svelte"
    import Markdown from "./app/markdown.svelte"

    import Menu from "./menu.svelte"
    import Page from "./app/page.svelte"

    import page from "$/state/page"

    const { sidebar, title } = window.siteConfig

    const showMenu = () => drawer.open(Menu, { content: sidebar })

    hljs.configure({
        ignoreUnescapedHTML: true,
    })

    $: page.load($hash || "index")
</script>

<svelte:head>
    <title>
        {title}
    </title>
</svelte:head>

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
    :global(iframe) {
        width: 100%;
        height: 250px;
        border: 1px solid var(--primary);
        border-radius: 4px;
    }
    :global(pre) {
        overflow-x: auto;
    }
</style>

<AppStyle {baseline} theme={$theme} />

<Screen full>
    <Appbar slot="title">
        {title}

        <Button on:click={showMenu} adorn slot="menu">
            <Icon name="bars" />
        </Button>
    </Appbar>
    <Paper square lscrollable>
        <content-wrapper>
            <Theme />
            {#if $page === null}
                Loading...
            {:else}
                <Page html={$page} />
            {/if}
        </content-wrapper>
    </Paper>
</Screen>
