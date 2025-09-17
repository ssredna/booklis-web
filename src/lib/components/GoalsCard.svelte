<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { CreateGoalSchema } from '$lib/schemas/createGoalSchema';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import CreateGoalModal from './CreateGoalModal.svelte';
	import { Button } from './ui/button';
	import * as Card from './ui/card';
	import type { Snippet } from 'svelte';
	import DarkModeToggle from './DarkModeToggle.svelte';
	import { isOwner } from '$lib/stores/isOwnerStore';
	import { getLibrary } from '$lib/state/Library.svelte';

	interface Props {
		createGoalForm: SuperValidated<Infer<CreateGoalSchema>>;
		children?: Snippet;
	}

	let { createGoalForm, children }: Props = $props();

	const library = getLibrary();
</script>

<Card.Root class="mb-6 w-full max-w-xl">
	<Card.Header>
		<div class="flex items-center justify-between">
			<Card.Title class="text-2xl font-bold">Lesemål</Card.Title>
			<DarkModeToggle />
		</div>
	</Card.Header>

	<Card.Content class="grid gap-6">
		{@render children?.()}
	</Card.Content>

	{#if $isOwner}
		<Card.Footer class="flex flex-col items-start gap-2 lg:flex-row lg:justify-between">
			<CreateGoalModal inputForm={createGoalForm}>
				<Button>Legg til nytt mål</Button>
			</CreateGoalModal>

			{#if library.pagesReadToday > 0}
				<form method="post" action="?/resetToday" use:enhance>
					<Button variant="destructive" type="submit">Nullstill sider lest i dag</Button>
					{#if page.form?.resetTodayError}
						<p>Noe gikk galt under nullstillingen</p>
					{/if}
				</form>
			{/if}
		</Card.Footer>
	{/if}
</Card.Root>
