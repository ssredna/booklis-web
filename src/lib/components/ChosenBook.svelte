<script lang="ts">
	import { enhance } from '$app/forms';
	import { X } from 'lucide-svelte';
	import { Button } from './ui/button';
	import { books } from '$lib/stores/booksStore';
	import { chosenBooks } from '$lib/stores/chosenBooksStore';

	export let chosenBookId: string;
	export let goalId: string;

	$: bookId = $chosenBooks[chosenBookId];
	$: book = $books[bookId];
</script>

{#if book}
	<div class="grid grid-cols-3">
		<div class="col-span-2">
			<h4 class="text-xl font-bold tracking-tight">{book.title}</h4>
			<small>{book.pageCount} sider</small>
		</div>
		<div class="flex place-content-between items-center">
			<form action="?/startBook" method="post" use:enhance>
				<input type="hidden" name="bookId" value={bookId} required />
				<input type="hidden" name="goalId" value={goalId} required />
				<input type="hidden" name="chosenBookId" value={chosenBookId} required />
				<Button type="submit">Start bok</Button>
			</form>

			<form action="?/removeBook" method="post" use:enhance>
				<input type="hidden" name="chosenBookId" value={chosenBookId} required />
				<input type="hidden" name="goalId" value={goalId} required />
				<Button type="submit" variant="outline">
					<X class="h-4 w-4" />
				</Button>
			</form>
		</div>
	</div>
{:else}
	<small class="text-destructive">
		Noe gikk galt, klarte ikke å finne boken med id: "{chosenBookId}"
	</small>
{/if}
