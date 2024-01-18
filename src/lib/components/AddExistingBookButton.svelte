<script lang="ts">
	import type { Book } from '$lib/core/book';
	import { Button } from './ui/button';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { AddExistingBookSchema } from '$lib/schemas/addExistingBookSchema';
	import { superForm } from 'sveltekit-superforms/client';
	import { Loader2 } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	export let book: Book;
	export let goalId: string;
	export let form: SuperValidated<AddExistingBookSchema>;

	const dispatch = createEventDispatcher();

	const { delayed, submitting, enhance } = superForm(form, {
		onUpdated: ({ form }) => {
			if (form.valid) dispatch('success');
		}
	});
</script>

<form action="?/addExistingBook" method="post" use:enhance>
	<input type="hidden" name="bookId" value={book.id} />
	<input type="hidden" name="goalId" value={goalId} />
	<Button type="submit" variant="outline" disabled={$submitting}>
		{#if $delayed}
			<Loader2 class="mr-2 h-4 w-4 animate-spin" />
		{/if}
		{book.title}
	</Button>
</form>
