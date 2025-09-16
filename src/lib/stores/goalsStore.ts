import { writable } from 'svelte/store';
import type { GoalType } from '$lib/types/goal';

export const goals = writable<Record<string, GoalType>>({});
