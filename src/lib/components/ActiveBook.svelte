<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ActiveBook } from '$lib/core/activeBook';
	import { Check, X } from 'lucide-svelte';
	import { Button } from './ui/button';
	import type { Writable } from 'svelte/store';
	import type { Goal } from '$lib/core/goal';
	import { books } from '$lib/booksStore';
	import { Book } from '$lib/core/book';

	export let activeBook: ActiveBook;
	export let goal: Writable<Goal>;

	$: book =
		$books.find((book) => book.id === activeBook.bookId) ??
		new Book('Error', 'Error, did not find book', 0);

	let pagesReadForm: HTMLFormElement;
	let isFormSubmitting = false;

	let oldPagesRead = activeBook.pagesRead;
	$: increase = activeBook.pagesRead - oldPagesRead;
</script>

<div class="grid grid-cols-4">
	<div class="col-span-3">
		<h4 class="text-xl font-bold tracking-tight">{book.title}</h4>
		<small>Lest {activeBook.pagesRead} av {book.pageCount} sider</small>

		<form
			bind:this={pagesReadForm}
			action="?/updatePagesRead"
			method="post"
			use:enhance={() => {
				isFormSubmitting = true;

				return async ({ update }) => {
					await update();
					isFormSubmitting = false;
				};
			}}
		>
			<input
				type="range"
				min="0"
				max={book.pageCount}
				step="1"
				name="pagesRead"
				bind:value={activeBook.pagesRead}
				on:change={() => {
					$goal.pagesReadToday = Math.max($goal.pagesReadToday + increase, 0);
					oldPagesRead = activeBook.pagesRead;
					pagesReadForm.requestSubmit();
				}}
				disabled={isFormSubmitting}
				class="w-full py-2"
			/>
			<input type="hidden" value={$goal.pagesReadToday} name="pagesReadToday" required />
			<input type="hidden" value={activeBook.id} name="activeBookId" required />
			<input type="hidden" value={$goal.id} name="goalId" required />

			{#if isFormSubmitting}
				Lagrer...
			{/if}

			{#if $page.form?.updatePagesReadError}
				<p>Noe gikk galt i lagringen</p>
			{/if}

			<noscript>
				<!-- If js is disabled there is no way to submit the form, so this is a backup -->
				<input type="submit" value="Lagre" />
			</noscript>
		</form>
	</div>

	<form
		action="?/removeActiveBook"
		method="post"
		use:enhance
		class="place-self-center justify-self-end"
	>
		<input type="hidden" name="bookId" value={book.id} required />
		<input type="hidden" name="goalId" value={$goal.id} required />
		<input type="hidden" name="activeBookId" value={activeBook.id} required />
		<Button type="submit" variant="outline">
			<X class="h-4 w-4" />
		</Button>
	</form>

	{#if activeBook.pagesRead === book.pageCount}
		<form action="?/finishBook" method="post" use:enhance>
			<input type="hidden" name="goalId" value={$goal.id} required />
			<input type="hidden" name="activeBookId" value={activeBook.id} required />
			<input type="hidden" name="bookId" value={book.id} required />
			<input type="hidden" name="startDate" value={activeBook.startDate} required />

			<Button type="submit">
				<Check class="mr-2 h-4 w-4" />
				Fullfør bok
			</Button>

			{#if $page.form?.finishBookError}
				<p>Noe gikk galt under flyttingen av boken til fullført</p>
			{/if}
		</form>
	{/if}
</div>
