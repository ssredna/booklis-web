<script lang="ts">
	import { onMount } from 'svelte';

	let modal: HTMLDialogElement;

	onMount(() => {
		modal.showModal();

		modal.addEventListener('click', (e) => {
			const dialogDimensions = modal.getBoundingClientRect();
			if (
				e.clientX < dialogDimensions.left ||
				e.clientX > dialogDimensions.right ||
				e.clientY < dialogDimensions.top ||
				e.clientY > dialogDimensions.bottom
			) {
				modal.close();
			}
		});
	});
</script>

<dialog bind:this={modal} on:close>
	<button on:click={() => modal.close()}>Lukk</button>
	<slot />
</dialog>
