<script lang="ts">
	import { enhance } from '$app/forms';
	import { books } from '$lib/booksStore';
	import type { ReadingGoal } from '$lib/core/readingGoal';
	import * as Dialog from './ui/dialog';
	import { Label } from './ui/label';
	import { Input } from './ui/input';
	import { Button } from './ui/button';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { AddBookSchema } from '$lib/schemas/addBookSchema';
	import { superForm } from 'sveltekit-superforms/client';
	import { Loader2 } from 'lucide-svelte';
	import { page } from '$app/stores';

	export let goal: ReadingGoal;
	export let inputForm: SuperValidated<AddBookSchema>;

	const {
		form,
		errors,
		delayed,
		submitting,
		enhance: addEnhance
	} = superForm(inputForm, {
		onUpdated: ({ form }) => {
			if (form.valid) isOpen = false;
		},
		resetForm: true
	});

	let isFormSubmitting = false;

	$: filteredBooks = $books.filter(
		(book) =>
			!goal.chosenBooks.some((chosenBook) => chosenBook.id === book.id) &&
			!goal.activeBooks.some((activeBook) => activeBook.book.id === book.id) &&
			!goal.readBooks.some((readBook) => readBook.book.id === book.id)
	);

	export let isOpen: boolean;
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>Legg til bok</Dialog.Header>
		<form method="post" action="?/addBook" use:addEnhance class="grid gap-6 py-4">
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

			{#each filteredBooks as book}
				<form
					action="?/addExistingBook"
					method="post"
					use:enhance={() => {
						isFormSubmitting = true;

						return async ({ result, update }) => {
							isFormSubmitting = false;
							update();
							if (result.type === 'success') {
								isOpen = false;
							}
						};
					}}
				>
					<input type="hidden" name="bookId" value={book.id} />
					<input type="hidden" name="goalId" value={goal.id} />
					<Button type="submit">
						{book.title}
					</Button>
				</form>
			{/each}
		{/if}
	</Dialog.Content>
</Dialog.Root>
