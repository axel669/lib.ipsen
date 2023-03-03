<script>
  export let lang
  export let text

  console.log("rendering", lang)
</script>

{#if lang === "iframe"}
    <div>Iframe!</div>
{:else}
    <pre class={lang}><code>{text}</code></pre>
{/if}
