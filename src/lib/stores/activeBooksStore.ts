import { writable } from 'svelte/store';
import type { ActiveBookType } from '$lib/types/activeBook';

export const activeBooks = writable<Record<string, ActiveBookType>>({});
