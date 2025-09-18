<script lang="ts">
	import type { DeleteGoalSchema } from '$lib/schemas/deleteGoalSchema';
	import type { EditGoalSchema } from '$lib/schemas/editGoalSchema';
	import type { GoalType } from '$lib/types/goal';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import EditGoalCard from './EditGoalCard.svelte';
	import { Button } from './ui/button';
	import { Edit } from '@lucide/svelte';
	import { isOwner } from '$lib/stores/isOwnerStore';
	import { getLibrary } from '$lib/state/Library.svelte';

	interface Props {
		goal: GoalType;
		editGoalForm: SuperValidated<Infer<EditGoalSchema>>;
		deleteGoalForm: SuperValidated<Infer<DeleteGoalSchema>>;
	}

	let { goal, editGoalForm, deleteGoalForm }: Props = $props();

	const library = getLibrary();

	let isEditing = $state(false);
</script>

{#if !isEditing}
	<div class="flex place-content-between items-center">
		<h4 class="text-lg/none font-bold tracking-tight">
			{library.goals[goal.id].goalTitle}
		</h4>

		{#if $isOwner}
			<Button onclick={() => (isEditing = true)} variant="outline">
				<Edit />
			</Button>
		{/if}
	</div>
{:else}
	<EditGoalCard
		{goal}
		{editGoalForm}
		{deleteGoalForm}
		on:finishedEditing={() => (isEditing = false)}
	/>
{/if}
