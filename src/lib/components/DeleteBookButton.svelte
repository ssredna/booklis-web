<script lang="ts">
	import { Trash2 } from 'lucide-svelte';
	import * as AlertDialog from './ui/alert-dialog';
	import { Button } from './ui/button';
	import { deleteBook } from '$lib/queries/books.svelte';

	type BookProps = {
		bookId: string;
		title: string;
	};

	let { bookId, title }: BookProps = $props();

	async function deleteBookHandler() {
		await deleteBook(bookId);
	}
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger asChild let:builder>
		<Button builders={[builder]} size="icon" variant="destructive">
			<Trash2 class="size-4" />
		</Button>
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Slette <i>{title}</i>?</AlertDialog.Title>
			<AlertDialog.Description>
				Er du sikker på at du vil slette <i>{title}</i> fra biblioteket ditt?
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Nei, avbryt</AlertDialog.Cancel>
			<AlertDialog.Action asChild let:builder>
				<Button {...builder} variant="destructive" onclick={deleteBookHandler}>Ja, slett</Button>
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
