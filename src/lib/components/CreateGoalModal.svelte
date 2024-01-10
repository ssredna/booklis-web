<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import Modal from './Modal.svelte';
	import dateFormat from 'dateformat';

	let isFormSubmitting = false;
	let deadline: string;

	const dispatch = createEventDispatcher();

	function setDeadlineToNextYear() {
		const thisYear = new Date().getFullYear();
		const endOfYearDate = new Date(Date.UTC(thisYear, 11, 31));
		deadline = dateFormat(endOfYearDate, 'yyyy-mm-dd');
	}
</script>

<Modal on:close>
	<h1>Lag et nytt mål</h1>
	<form
		method="post"
		action="?/createGoal"
		use:enhance={() => {
			isFormSubmitting = true;

			return async ({ result, update }) => {
				isFormSubmitting = false;
				update();
				if (result.type === 'success') {
					dispatch('close');
				}
			};
		}}
	>
		<label>
			Hvor mange bøker vil du lese?
			<input type="number" name="numberOfBooks" min="1" required />
		</label>
		{#if $page.form?.numberOfBooksError}
			<p>Er du sikker på at du har oppgitt et gyldig antall bøker?</p>
		{:else}
			<br />
		{/if}

		<label>
			Til når vil du nå målet ditt?
			<input type="date" name="deadline" bind:value={deadline} required />
		</label>
		<button on:click|preventDefault={setDeadlineToNextYear}> I løpet av året </button>

		{#if $page.form?.deadlineError}
			<p>Er du sikker på at du har oppgitt en gyldig dato?</p>
		{:else}
			<br />
		{/if}

		<input type="hidden" name="avgPageCount" value="350" />

		{#if isFormSubmitting}
			<p>Lagrer...</p>
		{/if}

		{#if $page.form?.unauthorized}
			<p>Du har ikke tilgang til å gjøre dette</p>
		{/if}
		<input type="submit" />
	</form>
</Modal>
