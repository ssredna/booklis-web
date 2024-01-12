<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Book } from '$lib/core/book';
	import { Trash } from 'lucide-svelte';
	import { Button } from './ui/button';

	export let book: Book;
	export let goalId: string;
</script>

<div class="grid grid-cols-3">
	<div class="col-span-2">
		<h4 class="text-xl font-bold tracking-tight">{book.title}</h4>
		<small>{book.pageCount} sider</small>
	</div>
	<div class="flex place-content-between">
		<form action="?/startBook" method="post" use:enhance>
			<input type="hidden" name="bookId" value={book.id} required />
			<input type="hidden" name="goalId" value={goalId} required />
			<Button type="submit">Start bok</Button>
		</form>

		<form action="?/removeBook" method="post" use:enhance>
			<input type="hidden" name="bookId" value={book.id} required />
			<input type="hidden" name="goalId" value={goalId} required />
			<Button type="submit" variant="destructive">
				<Trash class="h-4 w-4" />
			</Button>
		</form>
	</div>
</div>
