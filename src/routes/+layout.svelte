<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';

	const { children } = $props();
</script>

<ModeWatcher />

<main class="flex min-h-screen flex-col items-center justify-center p-2 lg:p-4">
	{@render children()}
</main>
