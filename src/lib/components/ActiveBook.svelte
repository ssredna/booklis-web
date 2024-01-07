<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActiveBook } from '$lib/core/activeBook';

	export let activeBook: ActiveBook;
	export let goalId: string;

	let pagesReadForm: HTMLFormElement;
	let isFormSubmitting = false;
</script>

<div class="container">
	<p>"{activeBook.book.title}"</p>
	<p>Lest {activeBook.pagesRead} av {activeBook.book.pageCount} sider</p>

	<form
		bind:this={pagesReadForm}
		action="?/updatePagesRead"
		method="post"
		use:enhance={() => {
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
			on:change={() => {
				pagesReadForm.requestSubmit();
			}}
			disabled={isFormSubmitting}
		/>
		<input type="hidden" value={activeBook.id} name="activeBookId" required />
		<input type="hidden" value={goalId} name="goalId" required />

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
		<input type="hidden" name="goalId" value={goalId} required />
		<input type="hidden" name="activeBookId" value={activeBook.id} required />
		<input type="submit" value="Fjern fra aktive bøker" />
	</form>
</div>

<style>
	.container {
		border: black 1px solid;
	}
</style>
