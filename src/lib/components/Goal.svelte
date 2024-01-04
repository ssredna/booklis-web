<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';

	export let numberOfBooks: number;
	export let deadline: string;
	export let id: string;

	$: deadlineDate = new Date(deadline);
</script>

<div class="container">
	<h1>{numberOfBooks} bøker til {deadlineDate.toDateString()}</h1>
	<form method="post" action="?/deleteGoal" use:enhance>
		<input type="hidden" name="id" value={id} />
		<input type="submit" value="Slett" />
		{#if $page.form?.idError}
			<p>Klarte ikke å slette, prøv igjen</p>
		{/if}
	</form>
</div>

<style>
	.container {
		border: black 1px solid;
	}
</style>
