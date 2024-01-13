<script lang="ts">
	import { books } from '$lib/booksStore.js';
	import CreateGoalModal from '$lib/components/CreateGoalModal.svelte';
	import Goal from '$lib/components/Goal.svelte';
	import MyBooksCard from '$lib/components/MyBooksCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Book } from '$lib/core/book.js';
	import { isOwner } from '$lib/isOwnerStore.js';
	import { signOut } from '@auth/sveltekit/client';

	export let data;

	$: books.set(data.books.map((book) => new Book(book.id, book.title, book.pageCount)));
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
	{#each data.goals as goalData}
		<Goal
			{goalData}
			editGoalForm={data.editGoalForm}
			deleteGoalForm={data.deleteGoalForm}
			addBookForm={data.addBookForm}
		/>
	{/each}
{/if}

{#if data.books.length !== 0}
	<MyBooksCard>
		{#each data.books as book}
			<p>{book.title}</p>
		{/each}
	</MyBooksCard>
{/if}

<Button on:click={() => signOut({ callbackUrl: '/' })}>Logg ut</Button>
