<script lang="ts">
	// import { books } from '$lib/stores/booksStore';
	import * as Dialog from './ui/dialog';
	import { Label } from './ui/label';
	import { Input } from './ui/input';
	import { Button } from './ui/button';
	// import type { SuperValidated } from 'sveltekit-superforms';
	// import type { AddBookSchema } from '$lib/schemas/addBookSchema';
	import { defaults, setMessage, superForm } from 'sveltekit-superforms/client';
	// import { Loader2 } from 'lucide-svelte';
	// import { page } from '$app/stores';
	// import { goals } from '$lib/stores/goalsStore';
	// import dateFormat from 'dateformat';
	import { z } from 'zod';
	import { zod } from 'sveltekit-superforms/adapters';
	import { client } from '$lib/client';

	const _bookSchema = z.object({
		title: z.string().min(2),
		totalPages: z.number().min(1)
	});

	const { form, errors, message, constraints, enhance } = superForm(defaults(zod(_bookSchema)), {
		SPA: true,
		validators: zod(_bookSchema),
		onUpdate: async ({ form }) => {
			if (form.valid) {
				setMessage(form, 'Form is valid');
				await client.insert('books', form.data);
				isOpen = false;
			}
		},
		resetForm: true
	});

	export let isOpen: boolean;
</script>

<Dialog.Root bind:open={isOpen}>
	<Dialog.Trigger />
	<Dialog.Content>
		<Dialog.Header>Legg til bok</Dialog.Header>
		{#if $message}<h3>{$message}</h3>{/if}
		<form method="post" use:enhance class="grid gap-6 py-4">
			<div class="grid gap-2">
				<Label for="title">Hva heter boken?</Label>
				<Input
					aria-invalid={$errors.title ? 'true' : undefined}
					{...$constraints.title}
					bind:value={$form.title}
				/>
				{#if $errors.title}
					<small class="text-destructive">{$errors.title}</small>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="pageCount">Hvor mange sider?</Label>
				<Input
					type="number"
					aria-invalid={$errors.totalPages ? 'true' : undefined}
					{...$constraints.totalPages}
					bind:value={$form.totalPages}
				/>
				{#if $errors.totalPages}
					<small class="text-destructive">{$errors.totalPages}</small>
				{/if}
			</div>

			<!-- <div class="grid gap-4">
				<Label>Hvilke mål vil du legge boken til i?</Label>
				{#each Object.values($goals) as goal}
					<Label>
						<input type="checkbox" name="goalIds" value={goal.id} class="mr-2" />
						{goal.numberOfBooks}
						{goal.numberOfBooks == 1 ? 'bok' : 'bøker'} til {dateFormat(
							goal.deadline,
							'yyyy-mm-dd'
						)}
					</Label>
				{/each}
				{#if $errors.goalIds}
					<small class="text-destructive">{$errors.goalIds._errors}</small>
				{/if}
			</div> -->

			<!-- {#if $page.form?.unauthorized}
				<p class="text-destructive">Du har ikke tilgang til å legge til en bok på dette målet.</p>
			{/if} -->

			<!-- {#if $page.form?.fireBaseError}
				<p>Det oppsto en feil med databasen:</p>
				<p>{$page.form?.fireBaseError}</p>
			{/if} -->

			<Button type="submit">
				<!-- {#if $delayed}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if} -->
				Legg til bok
			</Button>

			<!-- {#if Object.keys($books).length > 0}
				<h3>Vil du legge til en bok du allerede har?</h3>
				<div class="flex flex-wrap gap-2">
					{#each Object.entries($books) as [bookId, book]}
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
			{/if} -->
		</form>
	</Dialog.Content>
</Dialog.Root>
