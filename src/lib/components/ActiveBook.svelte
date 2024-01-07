<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActiveBook } from '$lib/core/activeBook';
	import type { ReadingGoal } from '$lib/core/readingGoal';

	export let activeBook: ActiveBook;
	export let goal: ReadingGoal;

	let pagesReadForm: HTMLFormElement;
	let isFormSubmitting = false;

	let oldPagesRead: number;
	$: increase = activeBook.pagesRead - oldPagesRead;
</script>

<div class="container">
	<p>"{activeBook.book.title}"</p>
	<p>Lest {activeBook.pagesRead} av {activeBook.book.pageCount} sider</p>

	<form
		bind:this={pagesReadForm}
		action="?/updatePagesRead"
		method="post"
		use:enhance={({ formData }) => {
			formData.append('pagesReadToday', String(goal.pagesReadToday));
			isFormSubmitting = true;

			return async ({ update }) => {
				isFormSubmitting = false;
				await update();
			};
		}}
	>
		<input
			type="range"
			min="0"
			max={activeBook.book.pageCount}
			step="1"
			name="pagesRead"
			bind:value={activeBook.pagesRead}
			on:mouseup={() => {
				goal.pagesReadToday += increase;
				pagesReadForm.requestSubmit();
			}}
			on:mousedown={() => (oldPagesRead = activeBook.pagesRead)}
			disabled={isFormSubmitting}
		/>
		<input type="hidden" value={activeBook.id} name="activeBookId" required />
		<input type="hidden" value={goal.id} name="goalId" required />

		{#if isFormSubmitting}
			Lagrer...
		{/if}

		<noscript>
			<!-- If js is disabled there is no way to submit the form, so this is a backup -->
			<input type="submit" value="Lagre" />
		</noscript>
	</form>

	<form action="?/removeActiveBook" method="post" use:enhance>
		<input type="hidden" name="bookId" value={activeBook.book.id} required />
		<input type="hidden" name="goalId" value={goal.id} required />
		<input type="hidden" name="activeBookId" value={activeBook.id} required />
		<input type="submit" value="Fjern fra aktive bøker" />
	</form>
</div>

<style>
	.container {
		border: black 1px solid;
	}
</style>