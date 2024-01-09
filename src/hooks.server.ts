import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { GOOGLE_ID, GOOGLE_SECRET } from '$env/static/private';

export const handle = SvelteKitAuth({
	providers: [
		Google({
			clientId: GOOGLE_ID,
			clientSecret: GOOGLE_SECRET,
			authorization: {
				params: {
					prompt: 'consent',
					access_type: 'offline',
					response_type: 'code'
				}
			}
		})
	],
	callbacks: {
		session: ({ session, token }) => {
			session.user = { ...session.user, id: token.sub ?? '' };
			return session;
		}
	}
});
