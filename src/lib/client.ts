import { TriplitClient } from '@triplit/client';
import { browser } from '$app/environment';
import { PUBLIC_TRIPLIT_URL, PUBLIC_TRIPLIT_TOKEN } from '$env/static/public';
import { schema } from '../../triplit/schema';

export const client = new TriplitClient({
	schema,
	serverUrl: PUBLIC_TRIPLIT_URL,
	token: PUBLIC_TRIPLIT_TOKEN,
	autoConnect: browser
});
