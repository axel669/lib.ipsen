<script context="module">
    import Select from "./form/select.svelte"
    import Text from "./form/text.svelte"
    import Toggle from "./form/toggle.svelte"

    const elems = {}

    export const registerFormElement = (type, element, initial) =>
        elems[type] = { element, initial }

    registerFormElement("text", Text, "")
    registerFormElement("select", Select, null)
    registerFormElement("toggle", Toggle, false)
</script>

<script>
    // * @Components/Composed // Form
    /**md
    Component for creating input forms through quick definitions instead
    of needing to layout and bind everything through sets of named functions
    and bound variables.
    */
    import { writable } from "svelte/store"

    /*md
    ## Props
    */
    /*md
    - items\\
        List of items to display in the form.
        ```js
        {
            // The type of form input. select, text, and toggle are supported.
            type: "string",
            // The property to use in the output value for the given input.
            name: "string",
            // Optional. An initial value to provide to the input.
            initial: any,
            // Optional. An object with props to pass to the component.
            props: {}
        }
        ```
    */
    export let items
    /*md
    - value\\
        The value to update with the various form input values. Will be an
        object with a prop for each item given. Setting this value will have no
        effect, the form only outputs to it through binding.
    */
    export let value

    const formValue = writable(value)

    // $: console.log($formValue)
    $: value = $formValue
</script>

{#each items as item}
    <svelte:component
        this={elems[item.type].element}
        initial={elems[item.type].initial}
        bind:output={$formValue[item.name]}
        props={item.props}
    />
{/each}
