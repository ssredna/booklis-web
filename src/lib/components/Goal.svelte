<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ReadingGoal } from '$lib/core/readingGoal';
	import dateFormat from 'dateformat';
	import AddBookModal from './AddBookModal.svelte';
	import ChosenBook from './ChosenBook.svelte';

	export let goal: ReadingGoal;

	$: dateString = dateFormat(goal.deadline, 'yyyy-mm-dd');

	let isEditing = false;
	let isFormSubmitting = false;

	let showAddBookModal = false;
</script>

<div class="container">
	{#if !isEditing}
		<h1>{goal.numberOfBooks} bøker til {goal.deadline.toDateString()}</h1>
		<p>Gjennomsnittlig sider per dag: {goal.pagesPerDay()}</p>
		<p>{goal.numberOfBooks - goal.readBooks.length} bøker igjen å lese</p>

		{#if goal.activeBooks.length > 0}
			<h2>Aktive bøker:</h2>
			{#each goal.activeBooks as activeBook}
				<p>{activeBook.book.title}</p>
			{/each}
		{:else}
			<p>Ingen bøker er aktive</p>
		{/if}

		<h2>Valgte bøker:</h2>
		{#each goal.chosenBooks as book}
			<ChosenBook {book} goalId={goal.id} />
		{/each}

		<button on:click={() => (showAddBookModal = true)}>Legg til bok</button>
		<br />

		{#if goal.readBooks.length > 0}
			<h2>Lese bøker:</h2>
			{#each goal.readBooks as readBook}
				<p>{readBook.book.title}</p>
			{/each}
		{:else}
			<p>Ingen bøker er fullført enda</p>
		{/if}

		<button on:click={() => (isEditing = true)}>Rediger mål</button>
		<form
			method="post"
			action="?/deleteGoal"
			use:enhance={({ cancel }) => {
				const conformed = confirm('Er du sikker?');
				if (!conformed) {
					cancel();
				}
			}}
		>
			<input type="hidden" name="id" value={goal.id} />
			<input type="submit" value="Slett mål" />
			{#if $page.form?.idError}
				<p>Klarte ikke å slette, prøv igjen</p>
			{/if}
		</form>
	{:else}
		<h1>Endre målet {goal.numberOfBooks} bøker til {goal.deadline.toDateString()}</h1>
		<form
			method="post"
			action="?/editGoal"
			use:enhance={() => {
				isFormSubmitting = true;

				return async ({ result, update }) => {
					isFormSubmitting = false;
					update();
					if (result.type === 'success') {
						isEditing = false;
					}
				};
			}}
		>
			<label>
				Hvor mange bøker vil du lese?
				<input value={goal.numberOfBooks} type="number" name="numberOfBooks" min="1" required />
			</label>
			{#if $page.form?.numberOfBooksError}
				<p>Er du sikker på at du har oppgitt et gyldig antall bøker?</p>
			{:else}
				<br />
			{/if}

			<label>
				Til når vil du nå målet ditt?
				<input value={dateString} type="date" name="deadline" required />
			</label>
			{#if $page.form?.deadlineError}
				<p>Er du sikker på at du har oppgitt en gyldig dato?</p>
			{:else}
				<br />
			{/if}

			{#if isFormSubmitting}
				<p>Lagrer...</p>
			{/if}

			<input type="hidden" name="id" value={goal.id} />
			<input type="submit" />
			<button on:click={() => (isEditing = false)}>Avbryt</button>
		</form>
	{/if}
</div>

{#if showAddBookModal}
	<AddBookModal {goal} on:close={() => (showAddBookModal = false)} />
{/if}

<style>
	.container {
		border: black 1px solid;
	}
</style>
