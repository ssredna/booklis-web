import { writable } from 'svelte/store';
import type { Goal } from '$lib/types/goal';

export const goals = writable<Record<string, Goal>>({});
