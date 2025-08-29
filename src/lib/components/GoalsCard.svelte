<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import type { CreateGoalSchema } from '$lib/schemas/createGoalSchema';
	import { goals } from '$lib/stores/goalsStore';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import CreateGoalModal from './CreateGoalModal.svelte';
	import { Button } from './ui/button';
	import * as Card from './ui/card';

	export let createGoalForm: SuperValidated<Infer<CreateGoalSchema>>;

	$: readAnyPagesToday = Object.values($goals).some((goal) => goal.pagesReadToday > 0);
</script>

<Card.Root class="mb-6 w-full max-w-xl">
	<Card.Header>
		<Card.Title class="text-2xl font-bold">Lesemål</Card.Title>
		<Card.Description>Oversikt over hvordan du ligger ann med lesemålene dine</Card.Description>
	</Card.Header>

	<Card.Content class="grid gap-6">
		<slot />
	</Card.Content>

	<Card.Footer class="flex flex-col items-start gap-2 lg:flex-row lg:justify-between">
		<CreateGoalModal inputForm={createGoalForm}>
			<Button>Legg til nytt mål</Button>
		</CreateGoalModal>

		{#if readAnyPagesToday}
			<form method="post" action="?/resetToday" use:enhance>
				<Button variant="destructive" type="submit">Nullstill sider lest i dag</Button>
				{#if $page.form?.resetTodayError}
					<p>Noe gikk galt under nullstillingen</p>
				{/if}
			</form>
		{/if}
	</Card.Footer>
</Card.Root>
