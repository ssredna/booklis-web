<script lang="ts">
	import * as Card from './ui/card';
	import { Button } from './ui/button';
	import { Edit } from '@lucide/svelte';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { EditGoalSchema } from '$lib/schemas/editGoalSchema';
	import { isOwner } from '$lib/stores/isOwnerStore';
	import type { DeleteGoalSchema } from '$lib/schemas/deleteGoalSchema';
	import EditGoalCard from './EditGoalCard.svelte';
	import { type Goal } from '$lib/types/goal';
	import { differenceInDays } from 'date-fns';
	import { dateFormatterShort } from '$lib/dateFormatters';
	import { getLibrary } from '$lib/state/Library.svelte';

	interface Props {
		goal: Goal;
		editGoalForm: SuperValidated<Infer<EditGoalSchema>>;
		deleteGoalForm: SuperValidated<Infer<DeleteGoalSchema>>;
	}

	let { goal, editGoalForm, deleteGoalForm }: Props = $props();

	const library = getLibrary();

	let pagesLeftInUnknownBooks = $derived(
		(goal.numberOfBooks -
			goal.chosenBooks.length -
			goal.activeBooks.length -
			goal.readBooks.length) *
			goal.avgPageCount
	);

	let totalPagesLeftInBooks = $derived(
		library.pagesLeftInActiveBooks + library.pagesLeftInChosenBooks + pagesLeftInUnknownBooks
	);

	let numberOfBooksLeft = $derived(goal.numberOfBooks - goal.readBooks.length);

	let pagesToRead = $derived(
		numberOfBooksLeft >= goal.activeBooks.length
			? totalPagesLeftInBooks
			: (totalPagesLeftInBooks / goal.activeBooks.length) * numberOfBooksLeft
	);

	let daysLeft = $derived(differenceInDays(goal.deadline, new Date()));

	let pagesPerDay = $derived(Math.ceil((pagesToRead + goal.pagesReadToday) / daysLeft));

	let pagesPerDayTomorrow = $derived(Math.ceil(pagesToRead / (daysLeft - 1)));

	let pagesLeftToday = $derived(
		Math.min(Math.max(pagesPerDay - goal.pagesReadToday, 0), pagesPerDay)
	);

	let dateString = $derived(dateFormatterShort.format(new Date(goal.deadline)));

	let isEditing = $state(false);
</script>

{#if !isEditing}
	<Card.Root class="w-full max-w-xl">
		<Card.Header>
			<Card.Title class="flex place-content-between">
				{goal.numberOfBooks}
				{goal.numberOfBooks == 1 ? 'bok' : 'bøker'} til {dateString}
				{#if $isOwner}
					<Button variant="link" onclick={() => (isEditing = true)} class="h-auto p-0">
						<Edit class="mr-2 size-4" />
						<span class="hidden lg:contents">Rediger mål</span>
					</Button>
				{/if}
			</Card.Title>
			<Card.Description>
				{goal.pagesReadToday <= pagesPerDay ? pagesPerDay : pagesPerDayTomorrow} sider om dagen for å
				nå målet
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="text-xl">
				<span class="text-3xl">{pagesLeftToday}</span>
				sider igjen i dag
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
