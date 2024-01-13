<script lang="ts">
	import * as Card from './ui/card';
</script>

<Card.Root class="mb-8 w-full max-w-xl">
	<Card.Header>
		<Card.Title class="text-2xl font-bold">Mine bøker</Card.Title>
		<Card.Description>Alle bøker du har lagt til i et mål på et tidspunkt</Card.Description>
	</Card.Header>
	<Card.Content class="grid grid-cols-2 gap-4">
		<slot />
	</Card.Content>
</Card.Root>
