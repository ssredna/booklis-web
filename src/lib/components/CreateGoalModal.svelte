<script lang="ts">
	import { page } from '$app/stores';
	import dateFormat from 'dateformat';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { CreateGoalSchema } from '$lib/schemas/createGoalSchema';
	import { dateProxy, superForm } from 'sveltekit-superforms/client';
	import { Label } from './ui/label';
	import { Input } from './ui/input';
	import { Button } from './ui/button';
	import { Loader2 } from 'lucide-svelte';

	export let inputForm: SuperValidated<CreateGoalSchema>;

	const { form, errors, delayed, submitting, enhance } = superForm(inputForm);

	function setDeadlineToNextYear() {
		const thisYear = new Date().getFullYear();
		const endOfYearDate = new Date(Date.UTC(thisYear, 11, 31));
		$deadlineProxy = dateFormat(endOfYearDate, 'yyyy-mm-dd');
	}

	const deadlineProxy = dateProxy(form, 'deadline', { format: 'date', empty: 'undefined' });
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<slot />
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>Opprett nytt mål</Dialog.Header>
		<Dialog.Description>
			Opprett et nytt lesemål her. Du kan gjøre endringer senere.
		</Dialog.Description>

		<form
			id="createGoalForm"
			method="post"
			action="?/createGoal"
			use:enhance
			class="grid gap-6 py-4"
		>
			<div class="grid gap-2">
				<Label for="numberOfBooks" class={$errors.numberOfBooks ? 'text-destructive' : ''}>
					Hvor mange bøker vil du lese?
				</Label>
				<Input
					id="numberOfBooks"
					name="numberOfBooks"
					type="number"
					bind:value={$form.numberOfBooks}
				/>
				{#if $errors.numberOfBooks}
					<small class="text-destructive">{$errors.numberOfBooks}</small>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="deadline" class={$errors.deadline ? 'text-destructive' : ''}>
					Til når vil du nå målet ditt?
				</Label>
				<div class="grid grid-cols-8 gap-2">
					<Input
						id="deadline"
						name="deadline"
						type="date"
						bind:value={$deadlineProxy}
						class="col-span-5"
					/>
					<Button on:click={setDeadlineToNextYear} class="col-span-3">I løpet av året</Button>
				</div>
				{#if $errors.deadline}
					<small class="text-destructive">{$errors.deadline}</small>
				{/if}
			</div>

			<input type="hidden" name="avgPageCount" value="350" />

			{#if $page.form?.unauthorized}
				<p class="text-destructive">Du har ikke tilgang til å gjøre dette.</p>
			{/if}

			{#if $page.form?.fireBaseError}
				<p>Det oppsto en feil med databasen:</p>
				<p>{$page.form?.fireBaseError}</p>
			{/if}
		</form>

		<Dialog.Footer>
			<Button type="submit" form="createGoalForm" disabled={$submitting}>
				{#if $delayed}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Opprett mål
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
