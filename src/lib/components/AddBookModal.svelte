<script lang="ts">
	import * as Dialog from './ui/dialog';
	import { Label } from './ui/label';
	import { Input } from './ui/input';
	import { Button } from './ui/button';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { AddBookSchema } from '$lib/schemas/addBookSchema';
	import { superForm } from 'sveltekit-superforms';
	import { Loader2 } from '@lucide/svelte';
	import { page } from '$app/state';
	import dateFormat from 'dateformat';
	import { getLibrary } from '$lib/state/Library.svelte';

	interface Props {
		addBookForm: SuperValidated<Infer<AddBookSchema>>;
		isOpen: boolean;
	}

	let { addBookForm, isOpen = $bindable() }: Props = $props();

	const library = getLibrary();

	const { form, errors, delayed, submitting, enhance } = superForm(addBookForm, {
		onUpdated: ({ form }) => {
			if (form.valid) isOpen = false;
		}
	});
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger />
	<Dialog.Content class="max-h-svh overflow-auto">
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

			<div class="grid gap-4">
				<Label>Hvilke mål vil du legge boken til i?</Label>
				{#each Object.values(library.goals) as goal}
					<Label>
						<input type="checkbox" name="goalIds" value={goal.id} class="mr-2" />
						{library.goals[goal.id].goalTitle}
					</Label>
				{/each}
				{#if $errors.goalIds}
					<small class="text-destructive">{$errors.goalIds._errors}</small>
				{/if}
			</div>

			{#if page.form?.unauthorized}
				<p class="text-destructive">Du har ikke tilgang til å legge til en bok på dette målet.</p>
			{/if}

			{#if page.form?.fireBaseError}
				<p>Det oppsto en feil med databasen:</p>
				<p>{page.form?.fireBaseError}</p>
			{/if}

			<Button type="submit" disabled={$submitting}>
				{#if $delayed}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Legg til bok
			</Button>

			{#if Object.keys(library.books).length > 0}
				<h3>Vil du legge til en bok du allerede har?</h3>
				<div class="flex flex-wrap gap-2">
					{#each Object.entries(library.books) as [bookId, book]}
						<Button
							type="submit"
							formaction="?/addExistingBook"
							name="bookId"
							value={bookId}
							variant="outline"
							disabled={$submitting}
						>
							{book.title}
						</Button>
					{/each}
				</div>

				{#if $errors.bookId}
					<small class="text-destructive">{$errors.bookId}</small>
				{/if}
			{/if}
		</form>
	</Dialog.Content>
</Dialog.Root>
