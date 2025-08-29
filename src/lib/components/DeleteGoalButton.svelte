<script lang="ts">
	import { Loader2, Trash } from 'lucide-svelte';
	import * as AlertDialog from './ui/alert-dialog';
	import { Button } from './ui/button';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { DeleteGoalSchema } from '$lib/schemas/deleteGoalSchema';
	import { superForm } from 'sveltekit-superforms';

	export let deleteGoalForm: SuperValidated<Infer<DeleteGoalSchema>>;
	export let goalId: string;

	const { delayed, submitting, enhance } = superForm(deleteGoalForm);
</script>

<form id="deleteGoalForm" method="post" action="?/deleteGoal" use:enhance>
	<input type="hidden" name="goalId" value={goalId} />
</form>

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
				Det går ikke ann å angre denne handlingen. All progresjon på dette målet vil bli slettet.
				Bøkene du har lagt til vil fortsatt være tilgjengelig.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Avbryt</AlertDialog.Cancel>
			<AlertDialog.Action asChild let:builder>
				<Button
					{...builder}
					type="submit"
					form="deleteGoalForm"
					variant="destructive"
					disabled={$submitting}
				>
					{#if $delayed}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					{/if}
					Slett mål
				</Button>
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
