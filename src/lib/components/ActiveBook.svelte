<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ActiveBook } from '$lib/core/activeBook';
	import type { ReadingGoal } from '$lib/core/readingGoal';
	import { Check, X } from 'lucide-svelte';
	import { Button } from './ui/button';

	export let activeBook: ActiveBook;
	export let goal: ReadingGoal;

	let pagesReadForm: HTMLFormElement;
	let isFormSubmitting = false;

	let oldPagesRead: number;
	$: increase = activeBook.pagesRead - oldPagesRead;
</script>

<div class="grid grid-cols-4">
	<div class="col-span-3">
		<h4 class="text-xl font-bold tracking-tight">{activeBook.book.title}</h4>
		<small>Lest {activeBook.pagesRead} av {activeBook.book.pageCount} sider</small>

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
				class="w-full py-2"
			/>
			<input type="hidden" value={activeBook.id} name="activeBookId" required />
			<input type="hidden" value={goal.id} name="goalId" required />

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
		<input type="hidden" name="bookId" value={activeBook.book.id} required />
		<input type="hidden" name="goalId" value={goal.id} required />
		<input type="hidden" name="activeBookId" value={activeBook.id} required />
		<Button type="submit" variant="destructive">
			<X class="h-4 w-4" />
		</Button>
	</form>

	{#if activeBook.pagesRead === activeBook.book.pageCount}
		<form action="?/finishBook" method="post" use:enhance>
			<input type="hidden" name="goalId" value={goal.id} required />
			<input type="hidden" name="activeBookId" value={activeBook.id} required />
			<input type="hidden" name="bookId" value={activeBook.book.id} required />
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
