<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { ReadingGoal } from '$lib/core/readingGoal';
	import dateFormat from 'dateformat';
	import AddBookModal from './AddBookModal.svelte';
	import ChosenBook from './ChosenBook.svelte';
	import ActiveBook from './ActiveBook.svelte';
	import ReadBook from './ReadBook.svelte';
	import * as Card from './ui/card';
	import { Button } from './ui/button';
	import { Edit } from 'lucide-svelte';
	import { Label } from './ui/label';
	import { Input } from './ui/input';

	export let goal: ReadingGoal;

	$: dateString = dateFormat(goal.deadline, 'yyyy-mm-dd');

	let isEditing = false;
	let isFormSubmitting = false;

	let showAddBookModal = false;
</script>

{#if !isEditing}
	<Card.Root class="mb-8 w-full max-w-2xl">
		<Card.Header>
			<Card.Title class="flex place-content-between">
				Lesemål
				<Button variant="link" on:click={() => (isEditing = true)} class="h-auto p-0">
					<Edit class="mr-2 h-4 w-4" />
					Rediger mål
				</Button>
			</Card.Title>
			<Card.Description>{goal.numberOfBooks} bøker til {dateString}</Card.Description>
		</Card.Header>
		<Card.Content>
			<p class="text-xl">
				<span class="text-3xl">{goal.pagesLeftToday()}</span>
				sider igjen i dag
			</p>
		</Card.Content>
		<Card.Footer>
			<small>
				{goal.pagesPerDay()} sider om dagen for å nå målet
			</small>
		</Card.Footer>

		{#if goal.pagesReadToday !== 0}
			<form method="post" action="?/resetToday" use:enhance>
				<input type="hidden" name="goalId" value={goal.id} />
				<input type="submit" value="Nullstill sider lest i dag" />
				{#if $page.form?.resetTodayError}
					<p>Noe gikk galt under nullstillingen</p>
				{/if}
			</form>
		{/if}
	</Card.Root>
{:else}
	<Card.Root class="mb-8 w-full max-w-2xl">
		<Card.Header>
			<Card.Title>Rediger målet</Card.Title>
			<Card.Description>
				Endre målet "{goal.numberOfBooks} bøker til {goal.deadline.toDateString()}"
			</Card.Description>
		</Card.Header>
		<Card.Content>
			<form
				id="editGoalForm"
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
				class="grid gap-6"
			>
				<div>
					<Label for="numberOfBooks">Hvor mange bøker vil du lese?</Label>
					<Input
						id="numberOfBooks"
						value={goal.numberOfBooks}
						type="number"
						name="numberOfBooks"
						min="1"
						required
					/>
					{#if $page.form?.numberOfBooksError}
						<p>Er du sikker på at du har oppgitt et gyldig antall bøker?</p>
					{/if}
				</div>

				<div>
					<Label for="deadline">Til når vil du nå målet ditt?</Label>
					<Input id="deadline" value={dateString} type="date" name="deadline" required />
					{#if $page.form?.deadlineError}
						<p>Er du sikker på at du har oppgitt en gyldig dato?</p>
					{/if}
				</div>

				{#if isFormSubmitting}
					<p>Lagrer...</p>
				{/if}

				{#if $page.form?.unauthorized}
					<p class="text-destructive">Du har ikke tilgang til å gjøre endringer</p>
				{/if}

				{#if $page.form?.fireBaseError}
					<p>Det oppsto en feil med databasen:</p>
					<p>{$page.form?.fireBaseError}</p>
				{/if}

				<input type="hidden" name="id" value={goal.id} />
			</form>
		</Card.Content>
		<Card.Footer class="flex gap-6">
			<Button form="editGoalForm" type="submit">Lagre</Button>
			<Button variant="destructive" on:click={() => (isEditing = false)}>Avbryt</Button>
		</Card.Footer>
	</Card.Root>
{/if}

{#if goal.activeBooks.length > 0}
	<h2>Aktive bøker:</h2>
	{#each goal.activeBooks as activeBook}
		<ActiveBook {activeBook} {goal} />
	{/each}
{:else}
	<p>Ingen bøker er aktive</p>
{/if}

{#if goal.chosenBooks.length > 0}
	<h2>Valgte bøker:</h2>
	{#each goal.chosenBooks as book}
		<ChosenBook {book} goalId={goal.id} />
	{/each}
{/if}

<button on:click={() => (showAddBookModal = true)}>Legg til bok</button>
<br />

{#if goal.readBooks.length > 0}
	<h2>Leste bøker:</h2>
	{#each goal.readBooks as readBook}
		<ReadBook {readBook} goalId={goal.id} />
	{/each}
{:else}
	<p>Ingen bøker er fullført enda</p>
{/if}

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

{#if showAddBookModal}
	<AddBookModal {goal} on:close={() => (showAddBookModal = false)} />
{/if}
