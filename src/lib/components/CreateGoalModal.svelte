<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import dateFormat from 'dateformat';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from './ui/input';
	import { Label } from './ui/label';
	import { Button } from './ui/button';

	let isFormSubmitting = false;
	let deadline: string;

	function setDeadlineToNextYear() {
		const thisYear = new Date().getFullYear();
		const endOfYearDate = new Date(Date.UTC(thisYear, 11, 31));
		deadline = dateFormat(endOfYearDate, 'yyyy-mm-dd');
	}
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<slot />
	</Dialog.Trigger>
	<Dialog.Content>
		<form
			method="post"
			action="?/createGoal"
			use:enhance={() => {
				isFormSubmitting = true;

				return async ({ update }) => {
					isFormSubmitting = false;
					update();
				};
			}}
		>
			<Dialog.Header>Opprett nytt mål</Dialog.Header>
			<Dialog.Description>
				Opprett et nytt lesemål her. Du kan gjøre endringer senere.
			</Dialog.Description>
			<Label>
				Hvor mange bøker vil du lese?
				<Input type="number" name="numberOfBooks" min="1" required />
			</Label>
			{#if $page.form?.numberOfBooksError}
				<p>Er du sikker på at du har oppgitt et gyldig antall bøker?</p>
			{:else}
				<br />
			{/if}

			<Label>
				Til når vil du nå målet ditt?
				<Input type="date" name="deadline" bind:value={deadline} required />
			</Label>
			<Button on:click={setDeadlineToNextYear}>I løpet av året</Button>

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
			<Dialog.Footer>
				<Button type="submit">Opprett mål</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
