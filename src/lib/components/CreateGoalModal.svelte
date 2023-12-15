<script lang="ts">
	import { onMount } from "svelte";

  let modal: HTMLDialogElement;

  onMount(() => {
    modal.showModal();
  })
</script>

<dialog bind:this={modal} on:close>
  <h1>Lag et nytt mål</h1>
</dialog>