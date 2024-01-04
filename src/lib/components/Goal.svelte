<script lang="ts">
	export let numberOfBooks: number;
	export let deadline: string;
	export let id: string;

	$: deadlineDate = new Date(deadline);
</script>

<div class="container">
	<h1>{numberOfBooks} bøker til {deadlineDate.toDateString()}</h1>
</div>

<style>
	.container {
		border: black 1px solid;
	}
</style>
