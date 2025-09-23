<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { getLibrary } from '$lib/state/Library.svelte';

	const library = getLibrary();
</script>

{#if Object.keys(library.books).length > 0}
	<Card.Root class="mb-8 w-full max-w-xl">
		<Card.Header>
			<Card.Title class="text-2xl font-bold">Mine bøker</Card.Title>
			<Card.Description>Alle bøker du har lagt til i et mål på et tidspunkt</Card.Description>
		</Card.Header>

		<Card.Content class="grid grid-cols-2 gap-4">
			{#each Object.values(library.books).sort((a, b) => a.title.localeCompare(b.title)) as book}
				<p>{book.title}</p>
			{/each}
		</Card.Content>
	</Card.Root>
{/if}
