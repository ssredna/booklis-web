<script>
	import AddBookModal from './AddBookModal.svelte';
	import { Button } from './ui/button';

	let showAddBookModal = $state(false);
</script>

<Button on:click={() => (showAddBookModal = true)} class="mb-6">Legg til bok</Button>
<AddBookModal bind:isOpen={showAddBookModal} />
