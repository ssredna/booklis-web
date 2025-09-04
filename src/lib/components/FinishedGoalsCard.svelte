<script lang="ts">
	import * as Card from './ui/card';
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<Card.Root class="mb-6 w-full max-w-xl">
	<Card.Header>
		<Card.Title class="text-2xl font-bold">Fullførte mål</Card.Title>
	</Card.Header>

	<Card.Content class="grid gap-6">
		{@render children?.()}
	</Card.Content>
</Card.Root>
