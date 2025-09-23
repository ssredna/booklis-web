<script lang="ts">
	import ChosenBook from '$lib/components/ChosenBook.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import { getLibrary } from '$lib/state/Library.svelte';

	const library = getLibrary();
</script>

{#if Object.keys(library.chosenBooks).length > 0}
	<Card.Root class="mb-8 w-full max-w-xl">
		<Card.Header>
			<Card.Title class="text-2xl font-bold">Valgte bøker</Card.Title>
			<Card.Description>De bøkene du har valgt, men ikke begynt å lese enda</Card.Description>
		</Card.Header>

		<Card.Content class="grid gap-4">
			{#each Object.keys(library.chosenBooks) as chosenBookId, i}
				<ChosenBook {chosenBookId} />
				{#if i < Object.keys(library.chosenBooks).length - 1}
					<Separator />
				{/if}
			{/each}
		</Card.Content>
	</Card.Root>
{/if}
