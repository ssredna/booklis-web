<script>
	import Modal from './Modal.svelte';
</script>

<Modal on:close>
	<h1>Lag et nytt mål</h1>
	<form method="post" action="home?/createGoal">
		<label>
			Hvor mange bøker vil du lese?
			<input type="number" name="numberOfBooks" min="0" required />
		</label>
		<br />
		<label>
			Til når vil du nå målet ditt?
			<input type="date" name="date" required />
		</label>
		<br />
		<input type="submit" />
	</form>
</Modal>
