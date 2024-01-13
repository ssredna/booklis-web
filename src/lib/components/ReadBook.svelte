<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ReadBook } from '$lib/core/readBook';
	import { Button } from './ui/button';

	export let readBook: ReadBook;
	export let goalId: string;
</script>

<div class="flex place-content-between items-center">
	<div>
		<h4 class="text-lg/none font-bold tracking-tight">{readBook.book.title}</h4>
		<small>
			Lest fra {readBook.startDate.toLocaleDateString()} til {readBook.endDate.toLocaleDateString()}
		</small>
	</div>
	<form method="post" action="?/reactivateBook" use:enhance>
		<input type="hidden" name="goalId" value={goalId} required />
		<input type="hidden" name="bookId" value={readBook.book.id} required />
		<input type="hidden" name="readBookId" value={readBook.id} required />
		<input type="hidden" name="startDate" value={readBook.startDate} required />
		<input type="hidden" name="pageCount" value={readBook.book.pageCount} required />

		<Button type="submit" variant="outline">Flytt tilbake til aktive bøker</Button>

		{#if $page.form?.reactivateBookError}
			<p>Noe gikk galt under re-aktiveringen</p>
		{/if}
	</form>
</div>
