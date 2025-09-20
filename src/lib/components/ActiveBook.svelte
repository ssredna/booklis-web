<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { Check, X } from '@lucide/svelte';
	import { Button } from './ui/button';
	import { Slider } from './ui/slider';
	import { isOwner } from '$lib/stores/isOwnerStore';
	import { getLibrary } from '$lib/state/Library.svelte';

	interface Props {
		activeBookId: string;
	}

	let { activeBookId }: Props = $props();

	const library = getLibrary();

	let activeBook = $derived(library.activeBooks[activeBookId]);
	let book = $derived(library.books[activeBook.bookId]);

	let pagesReadForm = $state<HTMLFormElement>();
	let isFormSubmitting = $state(false);

	let oldPagesRead = $state(library.activeBooks[activeBookId].pagesRead);
	let increase = $derived(activeBook.pagesRead - oldPagesRead);

	let isDirty = $state(false);
</script>

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
		</div>

		{#if $isOwner}
			<form
				action="?/removeActiveBook"
				method="post"
				use:enhance
				class="place-self-center justify-self-end"
			>
				<input type="hidden" name="bookId" value={activeBook.bookId} required />
				<input type="hidden" name="goalIds" value={activeBook.goals} required />
				<input type="hidden" name="activeBookId" value={activeBookId} required />
				<Button type="submit" size="icon" variant="destructive">
					<X class="size-4" />
				</Button>
			</form>
		{/if}
	</div>

	{#if $isOwner}
		<form
			bind:this={pagesReadForm}
			action="?/updatePagesRead"
			method="post"
			use:enhance={({ formData }) => {
				const goalIdsAndPagesReadToday = activeBook.goals.map((goalId) => {
					return [goalId, String(library.goals[goalId].pagesReadToday)];
				});
				formData.append('pagesReadToday', goalIdsAndPagesReadToday.join(';'));

				return async ({ update }) => {
					await update();
					isFormSubmitting = false;
					isDirty = false;
				};
			}}
		>
			<Slider
				bind:value={activeBook.pagesRead}
				type="single"
				min={0}
				max={book.pageCount}
				onValueChange={() => {
					isDirty = true;
				}}
				onValueCommit={() => {
					activeBook.goals.forEach((goalId) => {
						library.goals[goalId].pagesReadToday = Math.max(
							library.goals[goalId].pagesReadToday + increase,
							0
						);
					});
					oldPagesRead = activeBook.pagesRead;

					isFormSubmitting = true;
					pagesReadForm?.requestSubmit();
				}}
				class="mt-4 mb-2"
			/>
			<input type="hidden" value={activeBook.pagesRead} name="pagesRead" required />
			<input type="hidden" value={activeBookId} name="activeBookId" required />

			{#if page.form?.updatePagesReadError}
				<p>Noe gikk galt i lagringen</p>
			{/if}

			<noscript>
				<!-- If js is disabled there is no way to submit the form, so this is a backup -->
				<input type="submit" value="Lagre" />
			</noscript>
		</form>
	{/if}

	{#if activeBook.pagesRead === book.pageCount && !isDirty}
		<form action="?/finishBook" method="post" use:enhance>
			<input type="hidden" name="goalIds" value={activeBook.goals} required />
			<input type="hidden" name="activeBookId" value={activeBookId} required />
			<input type="hidden" name="bookId" value={activeBook.bookId} required />
			<input type="hidden" name="startDate" value={activeBook.startDate} required />

			<Button type="submit" class="float-end" disabled={isFormSubmitting}>
				<Check class="mr-2 size-4" />
				Fullfør bok
			</Button>

			{#if page.form?.finishBookError}
				<p>Noe gikk galt under flyttingen av boken til fullført</p>
			{/if}
		</form>
	{/if}
{:else}
	<small class="text-destructive">
		Noe gikk galt, klarte ikke å finne boken med id: "{activeBook.bookId}"
	</small>
{/if}
