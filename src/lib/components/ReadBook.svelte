<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ReadBook } from '$lib/core/readBook';

	export let readBook: ReadBook;
	export let goalId: string;
</script>

<div class="container">
	<p>{readBook.book.title}</p>
	<p>
		Lest fra {readBook.startDate.toLocaleDateString()} til {readBook.endDate.toLocaleDateString()}
	</p>
	<form method="post" action="?/reactivateBook" use:enhance>
		<input type="hidden" name="goalId" value={goalId} required />
		<input type="hidden" name="bookId" value={readBook.book.id} required />
		<input type="hidden" name="readBookId" value={readBook.id} required />
		<input type="hidden" name="startDate" value={readBook.startDate} required />
		<input type="hidden" name="pageCount" value={readBook.book.pageCount} required />

		<input type="submit" value="Flytt tilbake til aktive bøker" />

		{#if $page.form?.reactivateBookError}
			<p>Noe gikk galt under re-aktiveringen</p>
		{/if}
	</form>
</div>

<style>
	.container {
		border: black 1px solid;
	}
</style>
