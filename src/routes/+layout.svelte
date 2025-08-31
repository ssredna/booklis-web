<script lang="ts">
	import '../app.css';

	const { children } = $props();
</script>

<main class="flex min-h-screen flex-col items-center justify-center p-2 lg:p-4">
	{@render children()}
</main>
