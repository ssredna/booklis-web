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

	export let data;

	$: books.set(data.books);
	$: chosenBooks.set(data.chosenBooks);
	$: activeBooks.set(data.activeBooks);
	$: readBooks.set(data.readBooks);
	$: isOwner.set(data.isOwner);
</script>

{#if data.goals.length === 0 && data.isOwner}
	<h1 class="scroll-m-20 pb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
		Lag deg et lesemål
	</h1>
	<CreateGoalModal inputForm={data.createGoalForm}>
		<Button size="lg" class="mb-4">Opprett mål</Button>
	</CreateGoalModal>
{:else if data.goals.length === 0 && !data.isOwner}
	<h1 class="scroll-m-20 pb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
		Her er det ingen lesemål
	</h1>
	<Button size="lg" href="/home">Gå hjem</Button>
{:else}
	{#each data.goals as goal}
		{#key goal}
			<Goal
				{goal}
				editGoalForm={data.editGoalForm}
				deleteGoalForm={data.deleteGoalForm}
				addBookForm={data.addBookForm}
				addExistingBookForm={data.addExistingBookForm}
			/>
		{/key}
	{/each}
{/if}

{#if Object.keys(data.books).length > 0}
	<MyBooksCard>
		{#each Object.values(data.books) as book}
			<p>{book.title}</p>
		{/each}
	</MyBooksCard>
{/if}

<Button on:click={() => signOut({ callbackUrl: '/' })}>Logg ut</Button>
