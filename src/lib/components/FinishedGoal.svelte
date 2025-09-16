<script lang="ts">
	import { dateFormatterShort } from '$lib/dateFormatters';
	import type { DeleteGoalSchema } from '$lib/schemas/deleteGoalSchema';
	import type { EditGoalSchema } from '$lib/schemas/editGoalSchema';
	import type { GoalType } from '$lib/types/goal';
	import type { Infer, SuperValidated } from 'sveltekit-superforms';
	import EditGoalCard from './EditGoalCard.svelte';
	import { Button } from './ui/button';
	import { Edit } from '@lucide/svelte';
	import { isOwner } from '$lib/stores/isOwnerStore';

	interface Props {
		goal: GoalType;
		editGoalForm: SuperValidated<Infer<EditGoalSchema>>;
		deleteGoalForm: SuperValidated<Infer<DeleteGoalSchema>>;
	}

	let { goal, editGoalForm, deleteGoalForm }: Props = $props();

	let dateString = $derived(dateFormatterShort.format(new Date(goal.deadline)));

	let isEditing = $state(false);
</script>

{#if !isEditing}
	<div class="flex place-content-between items-center">
		<h4 class="text-lg/none font-bold tracking-tight">
			{goal.numberOfBooks}
			{goal.numberOfBooks == 1 ? 'bok' : 'bøker'} til {dateString}
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
