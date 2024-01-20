import { writable } from 'svelte/store';
import type { ReadBook } from '$lib/types/readBook';

export const readBooks = writable<Record<string, ReadBook>>({});
