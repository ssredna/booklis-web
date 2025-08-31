import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';

export const { handle: authHandle } = SvelteKitAuth({
	providers: [
		Google({
			profile(profile) {
				return profile;
			}
		})
	],
	callbacks: {
		jwt({ token, user }) {
			if (user) token.id = user.sub;
			return token;
		},
		session: ({ session, token }) => {
			session.user.id = token.id;
			return session;
		}
	}
});
