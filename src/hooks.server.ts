import { authHandle } from '$lib/auth';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';

const redirectToUserPage = (async ({ event, resolve }) => {
	if (event.url.pathname === '/home') {
		const session = await event.locals.auth();
		if (!session?.user) redirect(303, '/');
		redirect(303, '/' + session.user.id);
	}

	return resolve(event);
}) satisfies Handle;

const isOwner = (async ({ event, resolve }) => {
	if (event.params.userId) {
		const session = await event.locals.auth();

		const isOwner = !!session?.user && session.user.id === event.params.userId;

		event.locals.isOwner = isOwner;
	}

	return resolve(event);
}) satisfies Handle;

export const handle = sequence(authHandle, redirectToUserPage, isOwner);
