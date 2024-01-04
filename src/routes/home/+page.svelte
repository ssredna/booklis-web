<script lang="ts">
	import CreateGoalModal from '$lib/components/CreateGoalModal.svelte';
	import Goal from '$lib/components/Goal.svelte';

	export let data;

	let showCreateGoalModal = false;
</script>

{#each data.goals as goal}
	<Goal {...goal} />
{/each}

<button on:click={() => (showCreateGoalModal = true)}> Lag et nytt mål </button>

{#if showCreateGoalModal}
	<CreateGoalModal on:close={() => (showCreateGoalModal = false)} />
{/if}
