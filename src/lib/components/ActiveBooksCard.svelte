<script lang="ts">
	import * as Card from './ui/card';
</script>

<Card.Root class="mb-8 w-full max-w-xl">
	<Card.Header>
		<Card.Title class="text-2xl font-bold">Aktive bøker</Card.Title>
		<Card.Description>De bøkene du leser for tiden</Card.Description>
	</Card.Header>
	<Card.Content class="grid gap-6">
		<slot />
	</Card.Content>
</Card.Root>
