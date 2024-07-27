<script lang="ts">
	import { client } from '$lib/client';
	import { useQuery } from '@triplit/svelte';
	import { Button } from './ui/button';
	import * as Dialog from './ui/dialog';
	import { Input } from './ui/input';
	import { Label } from './ui/label';
	import { Trash2 } from 'lucide-svelte';
	import type { FormEventHandler } from 'svelte/elements';
	import { updateBookTitle, updateBookTotalPages } from '$lib/queries/books.svelte';

	type EditBookProps = {
		isOpen: boolean;
		bookId: string;
	};

	let { isOpen = $bindable(), bookId }: EditBookProps = $props();

	let bookData = useQuery(client, client.query('books').id(bookId));
	let bookArray = $derived(bookData.results ? Array.from(bookData.results) : []);
	let [_id, book] = $derived(bookArray[0]);

	const updateBookTitleHandler: FormEventHandler<HTMLInputElement> = async (event) => {
		const newTitle = event.currentTarget.value;
		await updateBookTitle(_id, newTitle);
	};

	const updateBookTotalPagesHandler: FormEventHandler<HTMLInputElement> = async (event) => {
		const newTotalPages = parseInt(event.currentTarget.value);
		await updateBookTotalPages(_id, newTotalPages);
	};
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>Rediger bok</Dialog.Header>
		<div class="grid gap-6 py-4">
			<div class="grid gap-2">
				<Label for="title">Tittel</Label>
				<Input value={book.title} oninput={updateBookTitleHandler} />
			</div>

			<div class="grid gap-2">
				<Label for="pageCount">Antall sider</Label>
				<Input type="number" value={book.totalPages} oninput={updateBookTotalPagesHandler} />
			</div>
		</div>

		<Dialog.Footer>
			<Button size="icon" variant="destructive" class="flex-shrink-0">
				<Trash2 class="size-4" />
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
