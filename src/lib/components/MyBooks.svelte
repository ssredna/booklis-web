<script lang="ts">
	import { getBookIds } from '$lib/queries/books.svelte';
	import * as Card from './ui/card';
	import AddBookButton from './AddBookButton.svelte';
	import Book from './Book.svelte';

	let data = getBookIds();
	let bookIdsArray = $derived(data.results ? Array.from(data.results) : []);
</script>

<Card.Root class="mb-8 w-full max-w-xl">
	<Card.Header>
		<Card.Title class="text-2xl font-bold">Mine bøker</Card.Title>
	</Card.Header>
	<Card.Content class="grid gap-4">
		{#each bookIdsArray as [bookId]}
			<Book {bookId} />
		{/each}
	</Card.Content>
</Card.Root>

<AddBookButton />
