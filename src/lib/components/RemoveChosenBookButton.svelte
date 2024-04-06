<script lang="ts">
	import { chosenBooks } from '$lib/stores/chosenBooksStore';
	import { X } from 'lucide-svelte';
	import * as AlertDialog from './ui/alert-dialog';
	import { Button } from './ui/button';
	import { enhance } from '$app/forms';
	import { goals } from '$lib/stores/goalsStore';
	import dateFormat from 'dateformat';

	export let chosenBookId: string;

	$: chosenBook = $chosenBooks[chosenBookId];
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger asChild let:builder>
		<Button variant="destructive" size="icon" builders={[builder]}>
			<X class="size-4" />
		</Button>
	</AlertDialog.Trigger>

	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Fjerne bok fra målet</AlertDialog.Title>
			<AlertDialog.Description>Hvilke mål vil du fjerne boken fra?</AlertDialog.Description>
		</AlertDialog.Header>

		<form id="removeBookForm" method="post" action="?/removeBook" use:enhance class="grid gap-2">
			<input type="hidden" name="chosenBookId" value={chosenBookId} />
			{#each chosenBook.goals as goalId}
				<label>
					<input type="checkbox" name="goalIds" value={goalId} />
					{$goals[goalId].numberOfBooks}
					{$goals[goalId].numberOfBooks == 1 ? 'bok' : 'bøker'} til {dateFormat(
						$goals[goalId].deadline,
						'yyyy-mm-dd'
					)}
				</label>
			{/each}
		</form>

		<AlertDialog.Footer>
			<AlertDialog.Cancel>Avbryt</AlertDialog.Cancel>
			<AlertDialog.Action asChild let:builder>
				<Button {...builder} type="submit" form="removeBookForm">Fjern bok fra valgte mål</Button>
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
