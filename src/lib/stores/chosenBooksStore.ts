import type { ChosenBookType } from '$lib/types/chosenBook';
import { writable } from 'svelte/store';

export const chosenBooks = writable<Record<string, ChosenBookType>>({});
