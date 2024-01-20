import { writable } from 'svelte/store';
import type { ReadBook } from '$lib/core/readBook';

export const readBooks = writable<Record<string, ReadBook>>({});
