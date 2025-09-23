<script lang="ts">
	import { getLibrary } from '$lib/state/Library.svelte';
	import ActiveBook from '$lib/components/ActiveBook.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import * as Card from '$lib/components/ui/card';

	const library = getLibrary();
</script>

{#if library.activeBookIds.length > 0}
	<Card.Root class="mb-8 w-full max-w-xl">
		<Card.Header>
			<Card.Title class="text-2xl font-bold">Aktive bøker</Card.Title>
		</Card.Header>

		<Card.Content class="grid gap-6">
			{#each library.activeBookIds as activeBookId, i (activeBookId)}
				<ActiveBook {activeBookId} />
				{#if i < library.activeBookIds.length - 1}
					<Separator />
				{/if}
			{/each}
		</Card.Content>
	</Card.Root>
{/if}
