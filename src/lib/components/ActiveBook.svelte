<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActiveBook } from '$lib/core/activeBook';

	export let activeBook: ActiveBook;
	export let goalId: string;
</script>

<div class="container">
	<p>"{activeBook.book.title}"</p>
	<p>Lest {activeBook.pagesRead} av {activeBook.book.pageCount} sider</p>

	<form action="?/removeActiveBook" method="post" use:enhance>
		<input type="hidden" name="bookId" value={activeBook.book.id} required />
		<input type="hidden" name="goalId" value={goalId} required />
		<input type="hidden" name="activeBookId" value={activeBook.id} required />
		<input type="submit" value="Fjern fra aktive bøker" />
	</form>
</div>

<style>
	.container {
		border: black 1px solid;
	}
</style>
