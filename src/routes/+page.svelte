<script>
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
</script>

<p class="mb-2 text-5xl font-bold">Velkommen til Booklis</p>
{#if page.data.session?.user}
	<Button size="lg" href="/home" class="my-4">Trykk her for å gå til lesemålet dit</Button>
	<Button variant="outline" onclick={() => signOut()}>Trykk her for å logge ut</Button>
{:else}
	<p class="mb-4 text-lg">Logg inn for å komme i gang med lesemål</p>
	<Button onclick={() => signIn('google', { callbackUrl: '/home' })}>Logg inn</Button>
{/if}
