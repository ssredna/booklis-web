<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { books } from '$lib/booksStore';
	import type { ReadBook } from '$lib/core/readBook';
	import { Button } from './ui/button';
	import dateFormat from 'dateformat';

	export let readBook: ReadBook;
	export let goalId: string;

	$: book = $books.find((book) => book.id === readBook.bookId) ?? {
		id: 'Error',
		title: 'Error, did not find book',
		pageCount: 0
	};

	$: formattedStartDate = dateFormat(readBook.startDate, 'yyyy-mm-dd');
	$: formattedEndDate = dateFormat(readBook.endDate, 'yyyy-mm-dd');
</script>

<div class="flex place-content-between items-center">
	<div>
		<h4 class="text-lg/none font-bold tracking-tight">{book.title}</h4>
		<small>
			Lest fra {formattedStartDate} til {formattedEndDate}
		</small>
	</div>
	<form method="post" action="?/reactivateBook" use:enhance>
		<input type="hidden" name="goalId" value={goalId} required />
		<input type="hidden" name="bookId" value={book.id} required />
		<input type="hidden" name="readBookId" value={readBook.id} required />
		<input type="hidden" name="startDate" value={readBook.startDate} required />
		<input type="hidden" name="pageCount" value={book.pageCount} required />

		<Button type="submit" variant="outline">Flytt tilbake til aktive bøker</Button>

		{#if $page.form?.reactivateBookError}
			<p>Noe gikk galt under re-aktiveringen</p>
		{/if}
	</form>
</div>
