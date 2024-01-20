import { writable } from 'svelte/store';
import type { ActiveBook } from '$lib/core/activeBook';

export const activeBooks = writable<Record<string, ActiveBook>>({});
