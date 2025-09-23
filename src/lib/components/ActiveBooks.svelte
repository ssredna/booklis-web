<script lang="ts">
	import { getLibrary } from '$lib/state/Library.svelte';
	import ActiveBook from '$lib/components/ActiveBook.svelte';
	import ActiveBooksCard from '$lib/components/ActiveBooksCard.svelte';
	import { Separator } from '$lib/components/ui/separator';

	const library = getLibrary();
</script>

{#if library.activeBookIds.length > 0}
	<ActiveBooksCard>
		{#each library.activeBookIds as activeBookId, i (activeBookId)}
			<ActiveBook {activeBookId} />
			{#if i < library.activeBookIds.length - 1}
				<Separator />
			{/if}
		{/each}
	</ActiveBooksCard>
{/if}
