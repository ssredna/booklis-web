<script lang="ts">
	import { client } from '$lib/client';
	import { myBooksQuery } from '$lib/queries/myBooks.svelte';
	import { useQuery } from '@triplit/svelte';
	import * as Card from './ui/card';
	import AddBookButton from './AddBookButton.svelte';

	let data = useQuery(client, myBooksQuery);
	let booksArray = $derived(data.results ? Array.from(data.results) : []);
</script>

<Card.Root class="mb-8 w-full max-w-xl">
	<Card.Header>
		<Card.Title class="text-2xl font-bold">Mine bøker</Card.Title>
	</Card.Header>
	<Card.Content class="grid grid-cols-2 gap-4">
		{#each booksArray as [_id, book]}
			<p>{book.title}</p>
		{/each}
	</Card.Content>
</Card.Root>

<AddBookButton />
