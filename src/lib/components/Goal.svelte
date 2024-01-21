<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import dateFormat from 'dateformat';
	import AddBookModal from './AddBookModal.svelte';
	import ChosenBook from './ChosenBook.svelte';
	import ActiveBook from './ActiveBook.svelte';
	import ReadBook from './ReadBook.svelte';
	import * as Card from './ui/card';
	import { Button } from './ui/button';
	import { Edit } from 'lucide-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { CreateGoalSchema } from '$lib/schemas/createGoalSchema';
	import { isOwner } from '$lib/stores/isOwnerStore';
	import type { DeleteGoalSchema } from '$lib/schemas/deleteGoalSchema';
	import type { AddBookSchema } from '$lib/schemas/addBookSchema';
	import ChosenBooksCard from './ChosenBooksCard.svelte';
	import ActiveBooksCard from './ActiveBooksCard.svelte';
	import { Separator } from './ui/separator';
	import ReadBooksCard from './ReadBooksCard.svelte';
	import EditGoalCard from './EditGoalCard.svelte';
	import { type Goal } from '$lib/types/goal';
	import { books } from '$lib/stores/booksStore';
	import { differenceInDays } from 'date-fns';
	import type { AddExistingBookSchema } from '$lib/schemas/addExistingBookSchema';
	import { activeBooks } from '$lib/stores/activeBooksStore';

	export let goal: Goal;
	export let editGoalForm: SuperValidated<CreateGoalSchema>;
	export let deleteGoalForm: SuperValidated<DeleteGoalSchema>;
	export let addBookForm: SuperValidated<AddBookSchema>;
	export let addExistingBookForm: SuperValidated<AddExistingBookSchema>;

	$: pagesLeftInActiveBooks = goal.activeBooks.reduce((pagesLeftTotal, activeBookId) => {
		const activeBook = $activeBooks[activeBookId];
		const book = $books[activeBook.bookId];
		const pagesInBook = book?.pageCount ?? 0;
		return pagesLeftTotal + (pagesInBook - activeBook.pagesRead);
	}, 0);

	$: pagesLeftInChosenBooks = goal.chosenBooks.reduce((pagesLeftTotal, chosenBook) => {
		const book = $books[chosenBook];
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

	$: pagesPerDay = Math.ceil(pagesToRead / daysLeft);

	$: pagesLeftToday = Math.min(Math.max(pagesPerDay - goal.pagesReadToday, 0), pagesPerDay);

	$: dateString = dateFormat(goal.deadline, 'yyyy-mm-dd');

	let isEditing = false;

	let showAddBookModal = false;
</script>

{#if !isEditing}
	<Card.Root class="mb-8 w-full max-w-xl">
		<Card.Header>
			<Card.Title class="flex place-content-between text-2xl font-extrabold">
				Lesemål
				{#if $isOwner}
					<Button variant="link" on:click={() => (isEditing = true)} class="h-auto p-0">
						<Edit class="mr-2 h-4 w-4" />
						Rediger mål
					</Button>
				{/if}
			</Card.Title>
			<Card.Description>{goal.numberOfBooks} bøker til {dateString}</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="text-xl">
				<span class="text-3xl">{pagesLeftToday}</span>
				sider igjen i dag
			</p>
		</Card.Content>
		<Card.Footer class="flex justify-between">
			<small>
				{pagesPerDay} sider om dagen for å nå målet
			</small>
			{#if goal.pagesReadToday !== 0}
				<form method="post" action="?/resetToday" use:enhance>
					<Button type="submit">Nullstill sider lest i dag</Button>
					{#if $page.form?.resetTodayError}
						<p>Noe gikk galt under nullstillingen</p>
					{/if}
				</form>
			{/if}
		</Card.Footer>
	</Card.Root>
{:else}
	<EditGoalCard
		{goal}
		{editGoalForm}
		{deleteGoalForm}
		on:finishedEditing={() => (isEditing = false)}
	/>
{/if}

{#if goal.chosenBooks.length === 0 && goal.activeBooks.length === 0 && goal.readBooks.length === 0 && $isOwner}
	<h2 class="pb-4 text-3xl font-extrabold tracking-tight">På tide å komme i gang!</h2>
	<Button on:click={() => (showAddBookModal = true)} class="mb-4">Legg til bok</Button>
{/if}

{#if goal.activeBooks.length > 0}
	<ActiveBooksCard>
		{#each goal.activeBooks as activeBookId, i (activeBookId)}
			<ActiveBook {activeBookId} {goal} />
			{#if i < goal.activeBooks.length - 1}
				<Separator />
			{/if}
		{/each}
	</ActiveBooksCard>
{/if}

{#if goal.chosenBooks.length > 0}
	<ChosenBooksCard>
		{#each goal.chosenBooks as bookId}
			<ChosenBook chosenBookId={bookId} goalId={goal.id} />
		{/each}
		<Button on:click={() => (showAddBookModal = true)}>Legg til bok</Button>
	</ChosenBooksCard>
{/if}

{#if goal.readBooks.length > 0}
	<ReadBooksCard>
		{#each goal.readBooks as readBookId}
			<ReadBook {readBookId} goalId={goal.id} />
		{/each}
	</ReadBooksCard>
{/if}

<AddBookModal {goal} {addBookForm} {addExistingBookForm} bind:isOpen={showAddBookModal} />
