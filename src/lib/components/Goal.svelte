<script lang="ts">
	import * as Card from './ui/card';
	import { Button } from './ui/button';
	import { Edit } from '@lucide/svelte';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { EditGoalSchema } from '$lib/schemas/editGoalSchema';
	import { isOwner } from '$lib/stores/isOwnerStore';
	import type { DeleteGoalSchema } from '$lib/schemas/deleteGoalSchema';
	import EditGoalCard from './EditGoalCard.svelte';
	import { type GoalType } from '$lib/types/goal';
	import { getLibrary } from '$lib/state/Library.svelte';

	interface Props {
		goal: GoalType;
		editGoalForm: SuperValidated<Infer<EditGoalSchema>>;
		deleteGoalForm: SuperValidated<Infer<DeleteGoalSchema>>;
	}

	let { goal, editGoalForm, deleteGoalForm }: Props = $props();

	const library = getLibrary();

	const pagesPerDay = $derived(library.goals[goal.id].pagesPerDay);
	const pagesPerDayTomorrow = $derived(library.goals[goal.id].pagesPerDayTomorrow);

	const displayedPagesLeftToday = $derived(
		goal.pagesReadToday <= pagesPerDay ? pagesPerDay : pagesPerDayTomorrow
	);

	let isEditing = $state(false);
</script>

{#if !isEditing}
	<Card.Root class="w-full max-w-xl">
		<Card.Header>
			<Card.Title class="flex place-content-between">
				{library.goals[goal.id].goalTitle}
				{#if $isOwner}
					<Button variant="link" onclick={() => (isEditing = true)} class="h-auto p-0">
						<Edit class="mr-2 size-4" />
						<span class="hidden lg:contents">Rediger mål</span>
					</Button>
				{/if}
			</Card.Title>
			<Card.Description>
				{displayedPagesLeftToday} sider om dagen for å nå målet
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="text-xl">
				<span class="text-3xl">{library.goals[goal.id].pagesLeftToday}</span>
				sider igjen i dag
				{#if library.goals[goal.id].activeBooks.length === 1}
					i
					<span class="italic">
						{library.books[library.activeBooks[library.goals[goal.id].activeBooks[0]].bookId].title}
					</span>
				{/if}
			</p>
		</Card.Content>
	</Card.Root>
{:else}
	<EditGoalCard
		{goal}
		{editGoalForm}
		{deleteGoalForm}
		on:finishedEditing={() => (isEditing = false)}
	/>
{/if}
