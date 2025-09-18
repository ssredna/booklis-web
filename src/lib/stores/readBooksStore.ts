import { writable } from 'svelte/store';
import type { ReadBookType } from '$lib/types/readBook';

export const readBooks = writable<Record<string, ReadBookType>>({});
