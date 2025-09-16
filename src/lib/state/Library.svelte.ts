import { getContext, setContext } from 'svelte';
import type { Book } from './Book.svelte';
import type { BookType } from '$lib/types/book';

type LibraryData = {
	books: Record<string, BookType>;
};

class Library {
	books: Record<string, Book>;

	constructor(data: LibraryData) {
		this.books = data.books;
	}
}

export function setLibrary(libraryData: LibraryData) {
	setContext('library', new Library(libraryData));
}

export function getLibrary() {
	return getContext('library') as Library;
}
