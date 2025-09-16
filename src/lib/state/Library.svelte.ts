import { getContext, setContext } from 'svelte';
import { Book } from './Book.svelte';
import type { BookType } from '$lib/types/book';
import type { ActiveBookType } from '$lib/types/activeBook';
import { ActiveBook } from './ActiveBook.svelte';

type LibraryData = {
	books: Record<string, BookType>;
	activeBooks: Record<string, ActiveBookType>;
};

class Library {
	books: Record<string, Book> = {};
	activeBooks: Record<string, ActiveBook> = {};

	constructor(data: LibraryData) {
		this.books = Object.fromEntries(
			Object.entries(data.books).map(([id, book]) => [id, new Book(book.title, book.pageCount)])
		);

		this.activeBooks = Object.fromEntries(
			Object.entries(data.activeBooks).map(([id, activeBook]) => [
				id,
				new ActiveBook(
					activeBook.bookId,
					activeBook.pagesRead,
					activeBook.startDate,
					activeBook.goals
				)
			])
		);
	}

	// define reactive derived after base fields are set
	pagesLeftInActiveBooks = $derived(
		Object.values(this.activeBooks).reduce((total, activeBook) => {
			const book = this.books[activeBook.bookId];
			if (!book) return total;
			return total + (book.pageCount - activeBook.pagesRead);
		}, 0)
	);
}

export function setLibrary(libraryData: LibraryData) {
	setContext('library', new Library(libraryData));
}

export function getLibrary() {
	return getContext('library') as Library;
}
