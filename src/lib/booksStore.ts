import { writable } from 'svelte/store';
import type { Book } from './core/book';

export const books = writable<Book[]>([]);
