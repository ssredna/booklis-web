<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ReadingGoal } from '$lib/core/readingGoal';
	import dateFormat from 'dateformat';

	export let goal: ReadingGoal;

	$: dateString = dateFormat(goal.deadline, 'yyyy-mm-dd');

	let isEditing = false;
	let isFormSubmitting = false;
</script>

<div class="container">
	{#if !isEditing}
		<h1>{goal.numberOfBooks} bøker til {goal.deadline.toDateString()}</h1>
		<button on:click={() => (isEditing = true)}>Endre</button>
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
			<input type="submit" value="Slett" />
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

<style>
	.container {
		border: black 1px solid;
	}
</style>
