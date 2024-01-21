<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { Check, X } from 'lucide-svelte';
	import { Button } from './ui/button';
	import type { Goal } from '$lib/types/goal';
	import { books } from '$lib/stores/booksStore';
	import { Slider } from './ui/slider';
	import { activeBooks } from '$lib/stores/activeBooksStore';

	export let activeBookId: string;
	export let goal: Goal;

	$: activeBook = $activeBooks[activeBookId];

	$: book = $books[activeBook.bookId];

	let sliderValue = [$activeBooks[activeBookId].pagesRead];
	$: activeBook.pagesRead = sliderValue[0];

	let pagesReadForm: HTMLFormElement;
	let isFormSubmitting = false;

	let oldPagesRead = $activeBooks[activeBookId].pagesRead;
	$: increase = activeBook.pagesRead - oldPagesRead;

	let isDirty = false;
</script>

<svelte:window
	on:click={() => {
		// Couldn't find a way to register clicks on the slider, so this is a workaround
		if (isDirty) {
			goal.pagesReadToday = Math.max(goal.pagesReadToday + increase, 0);
			oldPagesRead = activeBook.pagesRead;
			pagesReadForm.requestSubmit();
		}
	}}
/>

{#if book}
	<div class="grid grid-cols-4">
		<div class="col-span-3">
			<h4 class="text-xl font-bold tracking-tight">{book.title}</h4>
			<span class="flex place-content-between">
				<small>Lest {activeBook.pagesRead} av {book.pageCount} sider</small>
				{#if isFormSubmitting}
					<small>Lagrer...</small>
				{/if}
			</span>

			<form
				bind:this={pagesReadForm}
				action="?/updatePagesRead"
				method="post"
				use:enhance={({ formData }) => {
					formData.append('pagesReadToday', String(goal.pagesReadToday));
					isFormSubmitting = true;

					return async ({ update }) => {
						await update();
						isDirty = false;
						isFormSubmitting = false;
					};
				}}
			>
				<Slider
					bind:value={sliderValue}
					min={0}
					max={book.pageCount}
					onValueChange={() => {
						isDirty = true;
					}}
					class="mb-2 mt-4"
				/>
				<input type="hidden" value={activeBook.pagesRead} name="pagesRead" required />
				<input type="hidden" value={activeBookId} name="activeBookId" required />
				<input type="hidden" value={goal.id} name="goalId" required />

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
			<input type="hidden" name="bookId" value={activeBook.bookId} required />
			<input type="hidden" name="goalIds" value={activeBook.goals} required />
			<input type="hidden" name="activeBookId" value={activeBookId} required />
			<Button type="submit" variant="outline">
				<X class="h-4 w-4" />
			</Button>
		</form>

		{#if activeBook.pagesRead === book.pageCount}
			<form action="?/finishBook" method="post" use:enhance>
				<input type="hidden" name="goalId" value={goal.id} required />
				<input type="hidden" name="activeBookId" value={activeBookId} required />
				<input type="hidden" name="bookId" value={activeBook.bookId} required />
				<input type="hidden" name="startDate" value={activeBook.startDate} required />

				<Button type="submit" class="mt-2">
					<Check class="mr-2 h-4 w-4" />
					Fullfør bok
				</Button>

				{#if $page.form?.finishBookError}
					<p>Noe gikk galt under flyttingen av boken til fullført</p>
				{/if}
			</form>
		{/if}
	</div>
{:else}
	<small class="text-destructive">
		Noe gikk galt, klarte ikke å finne boken med id: "{activeBook.bookId}"
	</small>
{/if}
