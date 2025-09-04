<script lang="ts">
	import { books } from '$lib/stores/booksStore.js';
	import CreateGoalModal from '$lib/components/CreateGoalModal.svelte';
	import Goal from '$lib/components/Goal.svelte';
	import MyBooksCard from '$lib/components/MyBooksCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import { isOwner } from '$lib/stores/isOwnerStore.js';
	import { activeBooks } from '$lib/stores/activeBooksStore';
	import { chosenBooks } from '$lib/stores/chosenBooksStore';
	import { readBooks } from '$lib/stores/readBooksStore';
	import { signOut } from '@auth/sveltekit/client';
	import { goals } from '$lib/stores/goalsStore';
	import ReadBooksCard from '$lib/components/ReadBooksCard.svelte';
	import ReadBook from '$lib/components/ReadBook.svelte';
	import AddBookModal from '$lib/components/AddBookModal.svelte';
	import ChosenBooksCard from '$lib/components/ChosenBooksCard.svelte';
	import ChosenBook from '$lib/components/ChosenBook.svelte';
	import ActiveBooksCard from '$lib/components/ActiveBooksCard.svelte';
	import ActiveBook from '$lib/components/ActiveBook.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import GoalsCard from '$lib/components/GoalsCard.svelte';
	import FinishedGoalsCard from '$lib/components/FinishedGoalsCard.svelte';
	import FinishedGoal from '$lib/components/FinishedGoal.svelte';

	export let data;

	let showAddBookModal = false;

	$: books.set(data.books);
	$: goals.set(data.goals);
	$: chosenBooks.set(data.chosenBooks);
	$: activeBooks.set(data.activeBooks);
	$: readBooks.set(data.readBooks);
	$: isOwner.set(data.isOwner);

	$: activeGoals = Object.values(data.goals).filter(
		(goal) => goal.readBooks.length < goal.numberOfBooks
	);
	$: finishedGoals = Object.values(data.goals).filter(
		(goal) => goal.readBooks.length >= goal.numberOfBooks
	);
</script>

{#if activeGoals.length === 0 && data.isOwner}
	<h1 class="scroll-m-20 pb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
		Lag deg et lesemål
	</h1>
	<CreateGoalModal inputForm={data.createGoalForm}>
		<Button size="lg" class="mb-4">Opprett mål</Button>
	</CreateGoalModal>
{:else if activeGoals.length === 0 && !data.isOwner}
	<h1 class="scroll-m-20 pb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
		Her er det ingen lesemål
	</h1>
	<Button size="lg" href="/home">Gå hjem</Button>
{:else}
	{#key activeGoals}
		<GoalsCard createGoalForm={data.createGoalForm}>
			{#each activeGoals as goal}
				<Goal {goal} editGoalForm={data.editGoalForm} deleteGoalForm={data.deleteGoalForm} />
			{/each}
		</GoalsCard>
	{/key}
{/if}

{#if Object.keys(data.activeBooks).length > 0}
	{#key data.activeBooks}
		<ActiveBooksCard>
			{#each Object.keys(data.activeBooks) as activeBookId, i (activeBookId)}
				<ActiveBook {activeBookId} />
				{#if i < Object.keys(data.activeBooks).length - 1}
					<Separator />
				{/if}
			{/each}
		</ActiveBooksCard>
	{/key}
{/if}

{#if Object.keys(data.chosenBooks).length > 0}
	{#key data.chosenBooks}
		<ChosenBooksCard>
			{#each Object.keys(data.chosenBooks) as chosenBookId, i}
				<ChosenBook {chosenBookId} />
				{#if i < Object.keys(data.chosenBooks).length - 1}
					<Separator />
				{/if}
			{/each}
		</ChosenBooksCard>
	{/key}
{/if}

<Button onclick={() => (showAddBookModal = true)} class="mb-6">Legg til bok</Button>
<AddBookModal addBookForm={data.addBookForm} bind:isOpen={showAddBookModal} />

{#if finishedGoals.length > 0}
	{#key finishedGoals}
		<FinishedGoalsCard>
			{#each finishedGoals as goal}
				<FinishedGoal
					{goal}
					editGoalForm={data.editGoalForm}
					deleteGoalForm={data.deleteGoalForm}
				/>
			{/each}
		</FinishedGoalsCard>
	{/key}
{/if}

{#if Object.keys(data.readBooks).length > 0}
	{#key data.readBooks}
		<ReadBooksCard>
			{#each Object.keys(data.readBooks) as readBookId, i}
				<ReadBook {readBookId} />
				{#if i < Object.keys(data.readBooks).length - 1}
					<Separator />
				{/if}
			{/each}
		</ReadBooksCard>
	{/key}
{/if}

{#if Object.keys(data.books).length > 0}
	<MyBooksCard>
		{#each Object.values(data.books) as book}
			<p>{book.title}</p>
		{/each}
	</MyBooksCard>
{/if}

<Button onclick={() => signOut({ callbackUrl: '/' })}>Logg ut</Button>
