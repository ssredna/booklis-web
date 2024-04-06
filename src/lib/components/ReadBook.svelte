<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { dateFormatterShort } from '$lib/dateFormatters';
	import { books } from '$lib/stores/booksStore';
	import { readBooks } from '$lib/stores/readBooksStore';
	import { Button } from './ui/button';

	export let readBookId: string;

	$: readBook = $readBooks[readBookId];

	$: book = $books[readBook.bookId];

	$: formattedStartDate = dateFormatterShort.format(new Date(readBook.startDate));
	$: formattedEndDate = dateFormatterShort.format(new Date(readBook.endDate));
</script>

{#if book}
	<div class="flex flex-col gap-2 lg:flex-row lg:place-content-between lg:items-center">
		<div>
			<h4 class="text-lg/none font-bold tracking-tight">{book.title}</h4>
			<small>
				Lest fra {formattedStartDate} til {formattedEndDate}
			</small>
		</div>
		<form method="post" action="?/reactivateBook" use:enhance>
			<input type="hidden" name="goalIds" value={readBook.goals} required />
			<input type="hidden" name="bookId" value={readBook.bookId} required />
			<input type="hidden" name="readBookId" value={readBookId} required />
			<input type="hidden" name="startDate" value={readBook.startDate} required />
			<input type="hidden" name="pageCount" value={book.pageCount} required />

			<Button type="submit" variant="outline">Flytt tilbake til aktive bøker</Button>

			{#if $page.form?.reactivateBookError}
				<p>Noe gikk galt under re-aktiveringen</p>
			{/if}
		</form>
	</div>
{:else}
	<small class="text-destructive">
		Noe gikk galt, klarte ikke å finne boken med id: "{readBook.bookId}"
	</small>
{/if}
