<script lang="ts">
	import { Loader2 } from 'lucide-svelte';
	import { Button } from './ui/button';
	import * as Card from './ui/card';
	import { Input } from './ui/input';
	import { Label } from './ui/label';
	import DeleteGoalButton from './DeleteGoalButton.svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { EditGoalSchema } from '$lib/schemas/editGoalSchema';
	import { superForm } from 'sveltekit-superforms/client';
	import { createEventDispatcher } from 'svelte';
	import dateFormat from 'dateformat';
	import { page } from '$app/stores';
	import type { DeleteGoalSchema } from '$lib/schemas/deleteGoalSchema';
	import type { Goal } from '$lib/types/goal';

	export let goal: Goal;
	export let editGoalForm: SuperValidated<EditGoalSchema>;
	export let deleteGoalForm: SuperValidated<DeleteGoalSchema>;

	const dispatch = createEventDispatcher();

	const {
		errors: createErrors,
		delayed: createDelayed,
		submitting: createSubmitting,
		enhance: createEnhance
	} = superForm(editGoalForm, {
		onUpdated: ({ form }) => {
			if (form.valid) dispatch('finishedEditing');
		}
	});

	$: dateString = dateFormat(goal.deadline, 'yyyy-mm-dd');
</script>

<Card.Root class="mb-8 w-full max-w-xl">
	<Card.Header>
		<Card.Title>Rediger målet</Card.Title>
		<Card.Description>
			Endre målet "{goal.numberOfBooks} bøker til {dateString}"
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<form id="editGoalForm" method="post" action="?/editGoal" use:createEnhance class="grid gap-6">
			<div class="grid gap-2">
				<Label for="numberOfBooks" class={$createErrors.numberOfBooks ? 'text-destructive' : ''}>
					Hvor mange bøker vil du lese?
				</Label>
				<Input id="numberOfBooks" name="numberOfBooks" type="number" value={goal.numberOfBooks} />
				{#if $createErrors.numberOfBooks}
					<small class="text-destructive">{$createErrors.numberOfBooks}</small>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="deadline" class={$createErrors.numberOfBooks ? 'text-destructive' : ''}>
					Til når vil du nå målet ditt?
				</Label>
				<Input id="deadline" value={dateString} type="date" name="deadline" />
				{#if $createErrors.deadline}
					<small class="text-destructive">{$createErrors.deadline}</small>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="avgPageCount" class={$createErrors.avgPageCount ? 'text-destructive' : ''}>
					Gjennomsnittlig antall sider per bok
				</Label>
				<Input id="avgPageCount" name="avgPageCount" type="number" value={goal.avgPageCount} />
				<small>
					Brukes for å regne ut hvor mange sider du må lese, før du har lagt til alle de spesifikke
					bøkene.
				</small>
				{#if $createErrors.avgPageCount}
					<small class="text-destructive">{$createErrors.avgPageCount}</small>
				{/if}
			</div>

			{#if $page.form?.unauthorized}
				<p class="text-destructive">Du har ikke tilgang til å gjøre endringer</p>
			{/if}

			{#if $page.form?.fireBaseError}
				<p>Det oppsto en feil med databasen:</p>
				<p>{$page.form?.fireBaseError}</p>
			{/if}

			<input type="hidden" name="goalId" value={goal.id} />
		</form>
	</Card.Content>
	<Card.Footer class="place-content-between">
		<div class="flex gap-6">
			<Button type="submit" form="editGoalForm" disabled={$createSubmitting}>
				{#if $createDelayed}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Lagre
			</Button>
			<Button variant="destructive" on:click={() => dispatch('finishedEditing')}>Avbryt</Button>
		</div>
		<DeleteGoalButton goalId={goal.id} {deleteGoalForm} />
	</Card.Footer>
</Card.Root>
