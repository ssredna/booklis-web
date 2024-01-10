<script lang="ts">
	import { books } from '$lib/booksStore.js';
	import CreateGoalModal from '$lib/components/CreateGoalModal.svelte';
	import Goal from '$lib/components/Goal.svelte';
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

	let showCreateGoalModal = false;
</script>

{#each readingGoals as goal}
	<Goal {goal} />
{/each}

<button on:click={() => (showCreateGoalModal = true)}> Lag et nytt mål </button>

<h1>Mine bøker:</h1>
{#each data.books as book}
	<p>{book.title}</p>
{/each}

{#if showCreateGoalModal}
	<CreateGoalModal on:close={() => (showCreateGoalModal = false)} />
{/if}
