import { writable } from 'svelte/store';
import type { ActiveBook } from '$lib/types/activeBook';

export const activeBooks = writable<Record<string, ActiveBook>>({});
