import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import {
	FIREBASE_CLIENT_EMAIL,
	FIREBASE_PRIVATE_KEY,
	GOOGLE_ID,
	GOOGLE_SECRET,
	PROJECT_ID
} from '$env/static/private';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { cert } from 'firebase-admin/app';

export const handle = SvelteKitAuth({
	providers: [
		Google({
			clientId: GOOGLE_ID,
			clientSecret: GOOGLE_SECRET
		})
	],
	adapter: FirestoreAdapter({
		credential: cert({
			projectId: PROJECT_ID,
			clientEmail: FIREBASE_CLIENT_EMAIL,
			privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
		})
	})
});
