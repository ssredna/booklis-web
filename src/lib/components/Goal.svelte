<script lang="ts">
	import * as Card from './ui/card';
	import { Button } from './ui/button';
	import { Edit } from 'lucide-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { CreateGoalSchema } from '$lib/schemas/createGoalSchema';
	import { isOwner } from '$lib/stores/isOwnerStore';
	import type { DeleteGoalSchema } from '$lib/schemas/deleteGoalSchema';
	import EditGoalCard from './EditGoalCard.svelte';
	import { type Goal } from '$lib/types/goal';
	import { books } from '$lib/stores/booksStore';
	import { differenceInDays } from 'date-fns';
	import { activeBooks } from '$lib/stores/activeBooksStore';
	import { chosenBooks } from '$lib/stores/chosenBooksStore';
	import { dateFormatterShort } from '$lib/dateFormatters';

	export let goal: Goal;
	export let editGoalForm: SuperValidated<CreateGoalSchema>;
	export let deleteGoalForm: SuperValidated<DeleteGoalSchema>;

	$: pagesLeftInActiveBooks = goal.activeBooks.reduce((pagesLeftTotal, activeBookId) => {
		const activeBook = $activeBooks[activeBookId];
		const book = $books[activeBook.bookId];
		const pagesInBook = book?.pageCount ?? 0;
		return pagesLeftTotal + (pagesInBook - activeBook.pagesRead);
	}, 0);

	$: pagesLeftInChosenBooks = goal.chosenBooks.reduce((pagesLeftTotal, chosenBookId) => {
		const chosenBook = $chosenBooks[chosenBookId];
		const book = $books[chosenBook.bookId];
		const pagesInBook = book?.pageCount ?? 0;
		return pagesLeftTotal + pagesInBook;
	}, 0);

	$: pagesLeftInUnknownBooks =
		(goal.numberOfBooks -
			goal.chosenBooks.length -
			goal.activeBooks.length -
			goal.readBooks.length) *
		goal.avgPageCount;

	$: totalPagesLeftInBooks =
		pagesLeftInActiveBooks + pagesLeftInChosenBooks + pagesLeftInUnknownBooks;

	$: numberOfBooksLeft = goal.numberOfBooks - goal.readBooks.length;

	$: pagesToRead =
		numberOfBooksLeft >= goal.activeBooks.length
			? totalPagesLeftInBooks
			: (totalPagesLeftInBooks / goal.activeBooks.length) * numberOfBooksLeft;

	$: daysLeft = differenceInDays(goal.deadline, new Date());

	$: pagesPerDay = Math.ceil((pagesToRead + goal.pagesReadToday) / daysLeft);

	$: pagesPerDayTomorrow = Math.ceil(pagesToRead / (daysLeft - 1));

	$: pagesLeftToday = Math.min(Math.max(pagesPerDay - goal.pagesReadToday, 0), pagesPerDay);

	$: dateString = dateFormatterShort.format(new Date(goal.deadline));

	let isEditing = false;
</script>

{#if !isEditing}
	<Card.Root class="w-full max-w-xl">
		<Card.Header>
			<Card.Title class="flex place-content-between">
				{goal.numberOfBooks}
				{goal.numberOfBooks == 1 ? 'bok' : 'bøker'} til {dateString}
				{#if $isOwner}
					<Button variant="link" on:click={() => (isEditing = true)} class="h-auto p-0">
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
