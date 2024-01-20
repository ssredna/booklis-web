import { writable } from 'svelte/store';

export const chosenBooks = writable<Record<string, string>>({});
