<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from './ui/button';
	import RemoveChosenBookButton from './RemoveChosenBookButton.svelte';
	import { dateFormatterShort } from '$lib/dateFormatters';
	import { isOwner } from '$lib/stores/isOwnerStore';
	import { getLibrary } from '$lib/state/Library.svelte';

	interface Props {
		chosenBookId: string;
	}

	let { chosenBookId }: Props = $props();

	const library = getLibrary();

	let chosenBook = $derived(library.chosenBooks[chosenBookId]);
	let book = $derived(library.books[chosenBook.bookId]);
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
					&ensp; - {library.goals[goalId].numberOfBooks}
					{library.goals[goalId].numberOfBooks == 1 ? 'bok' : 'bøker'} til {dateFormatterShort.format(
						new Date(library.goals[goalId].deadline)
					)}
				</small>
			{/each}
		</div>
		{#if $isOwner}
			<div class="flex flex-col items-end gap-2 pt-2 lg:flex-row lg:place-content-between">
				<form action="?/startBook" method="post" use:enhance>
					<input type="hidden" name="bookId" value={chosenBook.bookId} required />
					<input type="hidden" name="goalIds" value={chosenBook.goals} required />
					<input type="hidden" name="chosenBookId" value={chosenBookId} required />
					<Button type="submit">Start bok</Button>
				</form>

				<RemoveChosenBookButton {chosenBookId} />
			</div>
		{/if}
	</div>
{:else}
	<small class="text-destructive">
		Noe gikk galt, klarte ikke å finne boken med id: "{chosenBookId}"
	</small>
{/if}
