<script lang="ts">
	import ReadBook from '$lib/components/ReadBook.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { getLibrary } from '$lib/state/Library.svelte';

	const library = getLibrary();
</script>

{#if Object.keys(library.readBooks).length > 0}
	<Card.Root class="mb-8 w-full max-w-xl">
		<Card.Header>
			<Card.Title class="text-2xl font-bold">Fullførte bøker</Card.Title>
			<Card.Description>De bøkene du er ferdig med</Card.Description>
		</Card.Header>

		<Card.Content class="grid gap-4">
			{#each Object.keys(library.readBooks) as readBookId, i}
				<ReadBook {readBookId} />
				{#if i < Object.keys(library.readBooks).length - 1}
					<Separator />
				{/if}
			{/each}
		</Card.Content>
	</Card.Root>
{/if}
