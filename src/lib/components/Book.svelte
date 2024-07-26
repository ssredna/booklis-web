<script lang="ts">
	import { client } from '$lib/client';
	import { Button } from './ui/button';
	import { Edit } from 'lucide-svelte';

	type BookProps = {
		bookId: string;
	};

	let { bookId }: BookProps = $props();

	let bookPromise = client.fetchById('books', bookId);
</script>

{#await bookPromise then book}
	{#if book}
		<article class="flex justify-between">
			<div>
				<h4 class="text-lg/none font-bold tracking-tight">{book.title}</h4>
				<small>
					{book.totalPages} sider
				</small>
			</div>
			<Button type="submit" size="icon" variant="outline" class="flex-shrink-0">
				<Edit class="size-4" />
			</Button>
		</article>
	{/if}
{/await}
