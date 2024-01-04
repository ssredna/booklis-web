<script lang="ts">
	import CreateGoalModal from '$lib/components/CreateGoalModal.svelte';
	import Goal from '$lib/components/Goal.svelte';
	import { ReadingGoal } from '$lib/core/readingGoal.js';

	export let data;

	$: readingGoals = data.goals.map(
		(goal) => new ReadingGoal(goal.id, goal.numberOfBooks, goal.deadline, goal.avgPageCount)
	);

	let showCreateGoalModal = false;
</script>

{#each readingGoals as goal}
	<Goal {goal} />
{/each}

<button on:click={() => (showCreateGoalModal = true)}> Lag et nytt mål </button>

{#if showCreateGoalModal}
	<CreateGoalModal on:close={() => (showCreateGoalModal = false)} />
{/if}
