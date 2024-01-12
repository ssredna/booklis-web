<script lang="ts">
	import * as Card from './ui/card';
</script>

<Card.Root class="mb-8 w-full max-w-xl">
	<Card.Header>
		<Card.Title class="text-2xl font-bold">Valgte bøker</Card.Title>
		<Card.Description>De bøkene du har valgt, men ikke begynt å lese enda</Card.Description>
	</Card.Header>
	<Card.Content class="grid gap-4">
		<slot />
	</Card.Content>
</Card.Root>
