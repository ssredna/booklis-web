<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { dateFormatterShort } from '$lib/dateFormatters';
	import { getLibrary } from '$lib/state/Library.svelte';
	import { isOwner } from '$lib/stores/isOwnerStore';
	import { Button } from './ui/button';

	interface Props {
		readBookId: string;
	}

	let { readBookId }: Props = $props();

	const library = getLibrary();

	let readBook = $derived(library.readBooks[readBookId]);

	let book = $derived(library.books[readBook.bookId]);

	let formattedStartDate = $derived(dateFormatterShort.format(new Date(readBook.startDate)));
	let formattedEndDate = $derived(dateFormatterShort.format(new Date(readBook.endDate)));
</script>

{#if book}
	<div class="flex flex-col gap-2 lg:flex-row lg:place-content-between lg:items-center">
		<div>
			<h4 class="text-lg/none font-bold tracking-tight">{book.title}</h4>
			<small>
				Lest fra {formattedStartDate} til {formattedEndDate}
			</small>
		</div>

		{#if $isOwner}
			<form method="post" action="?/reactivateBook" use:enhance>
				<input type="hidden" name="goalIds" value={readBook.goals} required />
				<input type="hidden" name="bookId" value={readBook.bookId} required />
				<input type="hidden" name="readBookId" value={readBookId} required />
				<input type="hidden" name="startDate" value={readBook.startDate} required />
				<input type="hidden" name="pageCount" value={book.pageCount} required />

				<Button type="submit" variant="outline">Flytt tilbake til aktive bøker</Button>

				{#if page.form?.reactivateBookError}
					<p>Noe gikk galt under re-aktiveringen</p>
				{/if}
			</form>
		{/if}
	</div>
{:else}
	<small class="text-destructive">
		Noe gikk galt, klarte ikke å finne boken med id: "{readBook.bookId}"
	</small>
{/if}
