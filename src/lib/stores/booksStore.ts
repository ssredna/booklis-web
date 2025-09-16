import { writable } from 'svelte/store';
import type { BookType } from '../types/book';

export const books = writable<Record<string, BookType>>({});
