import { getContext, setContext } from 'svelte';
import { Book } from './Book.svelte';
import type { BookType } from '$lib/types/book';

type LibraryData = {
	books: Record<string, BookType>;
};

class Library {
	books: Record<string, Book>;

	constructor(data: LibraryData) {
		this.books = Object.fromEntries(
			Object.entries(data.books).map(([id, book]) => [id, new Book(book.title, book.pageCount)])
		);
	}
}

export function setLibrary(libraryData: LibraryData) {
	setContext('library', new Library(libraryData));
}

export function getLibrary() {
	return getContext('library') as Library;
}
