<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from './ui/button';
	import { books } from '$lib/stores/booksStore';
	import { chosenBooks } from '$lib/stores/chosenBooksStore';
	import RemoveChosenBookButton from './RemoveChosenBookButton.svelte';
	import { goals } from '$lib/stores/goalsStore';
	import dateFormat from 'dateformat';

	export let chosenBookId: string;

	$: chosenBook = $chosenBooks[chosenBookId];
	$: book = $books[chosenBook.bookId];
</script>

{#if book}
	<div class="grid grid-cols-3">
		<div class="col-span-2">
			<h4 class="text-xl font-bold tracking-tight">{book.title}</h4>
			<small>{book.pageCount} sider</small>
			<br />
			<small>Som en del av: </small>
			{#each chosenBook.goals as goalId}
				<br />
				<small>
					&ensp; - {$goals[goalId].numberOfBooks} bøker til {dateFormat(
						$goals[goalId].deadline,
						'yyyy-mm-dd'
					)}
				</small>
			{/each}
		</div>
		<div class="flex place-content-between pt-2">
			<form action="?/startBook" method="post" use:enhance>
				<input type="hidden" name="bookId" value={chosenBook.bookId} required />
				<input type="hidden" name="goalIds" value={chosenBook.goals} required />
				<input type="hidden" name="chosenBookId" value={chosenBookId} required />
				<Button type="submit">Start bok</Button>
			</form>

			<RemoveChosenBookButton {chosenBookId} />
		</div>
	</div>
{:else}
	<small class="text-destructive">
		Noe gikk galt, klarte ikke å finne boken med id: "{chosenBookId}"
	</small>
{/if}
