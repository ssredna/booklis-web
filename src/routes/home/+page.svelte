<script lang="ts">
	import CreateGoalModal from "$lib/components/CreateGoalModal.svelte";

  let showCreateGoalModal = false;
</script>

<button on:click={() => showCreateGoalModal = true}>
  Lag et nytt mål
</button>

{#if showCreateGoalModal}
  <CreateGoalModal on:close={() => showCreateGoalModal = false} />
{/if}