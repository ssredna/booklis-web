import { writable } from 'svelte/store';
import type { Book } from './types/book';

export const books = writable<Record<string, Book>>({});
