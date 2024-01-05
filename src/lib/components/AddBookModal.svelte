<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import Modal from './Modal.svelte';
	import { createEventDispatcher } from 'svelte';

	export let goalId: string;

	let isFormSubmitting = false;

	const dispatch = createEventDispatcher();
</script>

<Modal on:close>
	<h1>Legg til bok</h1>
	<form
		method="post"
		action="?/addBook"
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
			Hva heter boken?
			<input type="text" name="title" required />
		</label>
		{#if $page.form?.titleError}
			<p>Er du sikker på at du har oppgitt en gyldig tittel?</p>
		{:else}
			<br />
		{/if}

		<label>
			Hvor mange sider?
			<input type="number" name="pageCount" min="1" required />
		</label>
		{#if $page.form?.pageCountError}
			<p>Er du sikker på at du har oppgitt et gyldig sideantall?</p>
		{:else}
			<br />
		{/if}

		<input type="hidden" name="goalId" value={goalId} />

		{#if isFormSubmitting}
			<p>Lagrer...</p>
		{/if}
		<input type="submit" value="Legg til bok" />
	</form>
</Modal>
