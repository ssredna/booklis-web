<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { books } from '$lib/booksStore';
	import type { ReadingGoal } from '$lib/core/readingGoal';
	import Modal from './Modal.svelte';
	import { createEventDispatcher } from 'svelte';

	export let goal: ReadingGoal;

	let isFormSubmitting = false;

	$: filteredBooks = $books.filter(
		(book) =>
			!goal.chosenBooks.some((chosenBook) => chosenBook.id === book.id) &&
			!goal.activeBooks.some((activeBook) => activeBook.book.id === book.id) &&
			!goal.readBooks.some((readBook) => readBook.book.id === book.id)
	);

	const dispatch = createEventDispatcher();
</script>

<Modal on:close>
	<h1>Legg til bok</h1>
	<form
		method="post"
		action="?/addBook"
		use:enhance={() => {
			isFormSubmitting = true;

			return async ({ result, update }) => {
				isFormSubmitting = false;
				update();
				if (result.type === 'success') {
					dispatch('close');
				}
			};
		}}
	>
		<label>
			Hva heter boken?
			<input type="text" name="title" required />
		</label>
		{#if $page.form?.titleError}
			<p>Er du sikker på at du har oppgitt en gyldig tittel?</p>
		{:else}
			<br />
		{/if}

		<label>
			Hvor mange sider?
			<input type="number" name="pageCount" min="1" required />
		</label>
		{#if $page.form?.pageCountError}
			<p>Er du sikker på at du har oppgitt et gyldig sideantall?</p>
		{:else}
			<br />
		{/if}

		<input type="hidden" name="goalId" value={goal.id} />

		{#if isFormSubmitting}
			<p>Lagrer...</p>
		{/if}
		<input type="submit" value="Legg til bok" />
	</form>

	{#if filteredBooks.length > 0}
		<p>Vil du legge til en bok du allerede har?</p>

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
							dispatch('close');
						}
					};
				}}
			>
				<input type="hidden" name="bookId" value={book.id} />
				<input type="hidden" name="goalId" value={goal.id} />
				<input type="submit" value={book.title} />
			</form>
		{/each}
	{/if}
</Modal>
