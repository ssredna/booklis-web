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
	import { Edit, Loader2, Trash } from 'lucide-svelte';
	import { Label } from './ui/label';
	import { Input } from './ui/input';
	import type { SuperValidated } from 'sveltekit-superforms';
	import type { CreateGoalSchema } from '../../routes/[userId]/createGoalSchema';
	import { superForm } from 'sveltekit-superforms/client';
	import { isOwner } from '$lib/isOwnerStore';
	import type { DeleteGoalSchema } from '../../routes/[userId]/deleteGoalSchema';
	import * as AlertDialog from './ui/alert-dialog';

	export let goal: ReadingGoal;
	export let createGoalForm: SuperValidated<CreateGoalSchema>;
	export let deleteGoalForm: SuperValidated<DeleteGoalSchema>;

	const {
		errors: createErrors,
		delayed: createDelayed,
		submitting: createSubmitting,
		enhance: createEnhance
	} = superForm(createGoalForm, {
		onUpdated: () => (isEditing = false)
	});

	const {
		delayed: deleteDelayed,
		submitting: deleteSubmitting,
		enhance: deleteEnhance
	} = superForm(deleteGoalForm);

	$: dateString = dateFormat(goal.deadline, 'yyyy-mm-dd');

	let isEditing = false;

	let showAddBookModal = false;
</script>

{#if !isEditing}
	<Card.Root class="mb-8 w-full max-w-2xl">
		<Card.Header>
			<Card.Title class="flex place-content-between">
				Lesemål
				{#if $isOwner}
					<Button variant="link" on:click={() => (isEditing = true)} class="h-auto p-0">
						<Edit class="mr-2 h-4 w-4" />
						Rediger mål
					</Button>
				{/if}
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
				use:createEnhance
				class="grid gap-6"
			>
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
						Brukes for å regne ut hvor mange sider du må lese, før du har lagt til alle de
						spesifikke bøkene.
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
				<Button variant="destructive" on:click={() => (isEditing = false)}>Avbryt</Button>
			</div>
			<AlertDialog.Root>
				<AlertDialog.Trigger asChild let:builder>
					<Button variant="destructive" builders={[builder]}>
						<Trash class="mr-2 h-4 w-4" />
						Slett mål
					</Button>
				</AlertDialog.Trigger>
				<AlertDialog.Content>
					<AlertDialog.Header>
						<AlertDialog.Title>Er du sikker på at du vil slette målet?</AlertDialog.Title>
						<AlertDialog.Description>
							Det går ikke ann å angre denne handlingen. All progresjon på dette målet vil bli
							slettet. Bøkene du har lagt til vil fortsatt være tilgjengelig.
						</AlertDialog.Description>
					</AlertDialog.Header>
					<form id="deleteGoalForm" method="post" action="?/deleteGoal" use:deleteEnhance>
						<input type="hidden" name="goalId" value={goal.id} />
					</form>
					<AlertDialog.Footer>
						<AlertDialog.Cancel>Avbryt</AlertDialog.Cancel>
						<AlertDialog.Action asChild let:builder>
							<Button
								{...builder}
								type="submit"
								form="deleteGoalForm"
								variant="destructive"
								disabled={$deleteSubmitting}
							>
								{#if $deleteDelayed}
									<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								{/if}
								Slett mål
							</Button>
						</AlertDialog.Action>
					</AlertDialog.Footer>
				</AlertDialog.Content>
			</AlertDialog.Root>
			{#if $page.form?.idError}
				<p>Klarte ikke å slette, prøv igjen</p>
			{/if}
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

{#if showAddBookModal}
	<AddBookModal {goal} on:close={() => (showAddBookModal = false)} />
{/if}
