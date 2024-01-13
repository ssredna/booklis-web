<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Book } from '$lib/core/book';
	import { createEventDispatcher } from 'svelte';
	import { Button } from './ui/button';

	export let book: Book;
	export let goalId: string;

	const dispatch = createEventDispatcher();

	let isFormSubmitting = false;
</script>

<form
	action="?/addExistingBook"
	method="post"
	use:enhance={() => {
		isFormSubmitting = true;

		return async ({ result, update }) => {
			isFormSubmitting = false;
			update();
			if (result.type === 'success') {
				dispatch('success');
			}
		};
	}}
>
	<input type="hidden" name="bookId" value={book.id} />
	<input type="hidden" name="goalId" value={goalId} />
	<Button type="submit" variant="outline" disabled={isFormSubmitting}>
		{book.title}
	</Button>
</form>
