<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Book } from '$lib/core/book';

	export let book: Book;
	export let goalId: string;
</script>

<div class="container">
	<p>"{book.title}" på {book.pageCount} sider</p>
	<form action="?/removeBook" method="post" use:enhance>
		<input type="hidden" name="bookId" value={book.id} required />
		<input type="hidden" name="goalId" value={goalId} required />
		<input type="submit" value="Fjern bok fra mål" />
	</form>
</div>

<style>
	.container {
		border: black 1px solid;
	}
</style>
