<script lang="ts">
	import EditBookModal from './EditBookModal.svelte';
	import { Button } from './ui/button';
	import { Edit } from 'lucide-svelte';
	import { getBook } from '$lib/queries/books.svelte';

	type BookProps = {
		bookId: string;
	};

	let { bookId }: BookProps = $props();

	let bookData = getBook(bookId);
	let bookArray = $derived(bookData.results ? Array.from(bookData.results) : []);
	let [_id, book] = $derived(bookArray[0]);

	let showEditBookModal = $state(false);
</script>

{#if bookData.results}
	<article class="flex justify-between">
		<div>
			<h4 class="text-lg/none font-bold tracking-tight">{book.title}</h4>
			<small>
				{book.totalPages} sider
			</small>
		</div>
		<Button
			size="icon"
			variant="outline"
			class="flex-shrink-0"
			onclick={() => (showEditBookModal = true)}
		>
			<Edit class="size-4" />
		</Button>
	</article>
{/if}

<EditBookModal {bookId} bind:isOpen={showEditBookModal} />
