<script lang="ts">
	import { Loader2, Trash } from '@lucide/svelte';
	import * as AlertDialog from './ui/alert-dialog';
	import { Button } from './ui/button';
	import type { SuperValidated, Infer } from 'sveltekit-superforms';
	import type { DeleteGoalSchema } from '$lib/schemas/deleteGoalSchema';
	import { superForm } from 'sveltekit-superforms';

	interface Props {
		deleteGoalForm: SuperValidated<Infer<DeleteGoalSchema>>;
		goalId: string;
	}

	let { deleteGoalForm, goalId }: Props = $props();

	const { delayed, submitting, enhance } = superForm(deleteGoalForm);
</script>

<form id="deleteGoalForm" method="post" action="?/deleteGoal" use:enhance>
	<input type="hidden" name="goalId" value={goalId} />
</form>

<AlertDialog.Root>
	<AlertDialog.Trigger>
		{#snippet child({ props })}
			<Button {...props} variant="destructive">
				<Trash class="h-4 w-4" />
			</Button>
		{/snippet}
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
			<AlertDialog.Action>
				{#snippet child({ props })}
					<Button
						{...props}
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
				{/snippet}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
