<script lang="ts">
	import { books } from '$lib/stores/booksStore';
	import * as Dialog from './ui/dialog';
	import { Label } from './ui/label';
	import { Input } from './ui/input';
	import { Button } from './ui/button';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { AddBookSchema } from '$lib/schemas/addBookSchema';
	import { superForm } from 'sveltekit-superforms/client';
	import { Loader2 } from 'lucide-svelte';
	import { page } from '$app/stores';
	import AddExistingBookButton from './AddExistingBookButton.svelte';
	import type { Goal } from '$lib/types/goal';
	import type { AddExistingBookSchema } from '$lib/schemas/addExistingBookSchema';
	import { activeBooks } from '$lib/stores/activeBooksStore';
	import { readBooks } from '$lib/stores/readBooksStore';
	import { chosenBooks } from '$lib/stores/chosenBooksStore';

	export let goal: Goal;
	export let addBookForm: SuperValidated<AddBookSchema>;
	export let addExistingBookForm: SuperValidated<AddExistingBookSchema>;

	const { form, errors, delayed, submitting, enhance } = superForm(addBookForm, {
		onUpdated: ({ form }) => {
			if (form.valid) isOpen = false;
		},
		resetForm: true
	});

	$: filteredBooks = Object.entries($books).filter(
		(book) =>
			!goal.chosenBooks.some((chosenBookId) => $chosenBooks[chosenBookId].bookId === book[0]) &&
			!goal.activeBooks.some((activeBookId) => $activeBooks[activeBookId].bookId === book[0]) &&
			!goal.readBooks.some((readBookId) => $readBooks[readBookId].bookId === book[0])
	);

	export let isOpen: boolean;
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>Legg til bok</Dialog.Header>
		<form method="post" action="?/addBook" use:enhance class="grid gap-6 py-4">
			<div class="grid gap-2">
				<Label for="title">Hva heter boken?</Label>
				<Input id="title" type="text" name="title" bind:value={$form.title} />
				{#if $errors.title}
					<small class="text-destructive">{$errors.title}</small>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="pageCount">Hvor mange sider?</Label>
				<Input id="pageCount" type="number" name="pageCount" bind:value={$form.pageCount} />
				{#if $errors.pageCount}
					<small class="text-destructive">{$errors.pageCount}</small>
				{/if}
			</div>

			<input type="hidden" name="goalId" value={goal.id} />

			{#if $page.form?.unauthorized}
				<p class="text-destructive">Du har ikke tilgang til å legge til en bok på dette målet.</p>
			{/if}

			{#if $page.form?.fireBaseError}
				<p>Det oppsto en feil med databasen:</p>
				<p>{$page.form?.fireBaseError}</p>
			{/if}

			<Button type="submit" disabled={$submitting}>
				{#if $delayed}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Legg til bok
			</Button>
		</form>

		{#if filteredBooks.length > 0}
			<h3>Vil du legge til en bok du allerede har?</h3>
			<div class="flex flex-wrap gap-2">
				{#each filteredBooks as book}
					<AddExistingBookButton
						form={addExistingBookForm}
						bookId={book[0]}
						goalId={goal.id}
						on:success={() => (isOpen = false)}
					/>
				{/each}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
