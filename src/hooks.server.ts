import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import { GOOGLE_ID, GOOGLE_SECRET } from '$env/static/private';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const { handle: authHandle } = SvelteKitAuth({
	providers: [
		Google({
			clientId: GOOGLE_ID,
			clientSecret: GOOGLE_SECRET,
			authorization: {
				params: { prompt: 'consent', access_type: 'offline', response_type: 'code' }
			}
		})
	],
	callbacks: {
		session: (args) => {
			const { session } = args;
			const sub = 'token' in args ? args.token?.sub : undefined;
			session.user = { ...session.user, id: sub ?? '' };
			return session;
		}
	}
});

const redirectToUserPage = (async ({ event, resolve }) => {
	if (event.url.pathname === '/home') {
		const session = await event.locals.getSession();
		if (!session?.user) redirect(303, '/');
		redirect(303, '/' + session.user.id);
	}

	return resolve(event);
}) satisfies Handle;

const isOwner = (async ({ event, resolve }) => {
	if (event.params.userId) {
		const session = await event.locals.getSession();

		const isOwner = !!session?.user && session.user.id === event.params.userId;

		event.locals.isOwner = isOwner;
	}

	return resolve(event);
}) satisfies Handle;

export const handle = sequence(authHandle, redirectToUserPage, isOwner);
