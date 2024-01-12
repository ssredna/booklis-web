<script lang="ts">
	import { books } from '$lib/booksStore.js';
	import CreateGoalModal from '$lib/components/CreateGoalModal.svelte';
	import Goal from '$lib/components/Goal.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Book } from '$lib/core/book.js';
	import { ReadingGoal } from '$lib/core/readingGoal.js';

	export let data;

	$: readingGoals = data.goals.map(
		(goal) =>
			new ReadingGoal(
				goal.id,
				goal.numberOfBooks,
				goal.deadline,
				goal.avgPageCount,
				goal.chosenBooks,
				goal.activeBooks,
				goal.readBooks,
				data.books,
				goal.pagesReadToday
			)
	);

	$: books.set(data.books.map((book) => new Book(book.id, book.title, book.pageCount)));
</script>

{#if readingGoals.length === 0 && data.isOwner}
	<h1 class="scroll-m-20 pb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
		Lag deg et lesemål
	</h1>
	<CreateGoalModal inputForm={data.form}>
		<Button size="lg">Opprett mål</Button>
	</CreateGoalModal>
{:else if readingGoals.length === 0 && !data.isOwner}
	<h1 class="scroll-m-20 pb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
		Her er det ingen lesemål
	</h1>
	<Button size="lg" href="/home">Gå hjem</Button>
{:else}
	{#each readingGoals as goal}
		<Goal {goal} />
	{/each}
{/if}

{#if data.books.length !== 0}
	<h1>Mine bøker:</h1>
	{#each data.books as book}
		<p>{book.title}</p>
	{/each}
{/if}
