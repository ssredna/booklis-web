import { getContext, setContext } from 'svelte';
import { Book } from './Book.svelte';
import { ActiveBook } from './ActiveBook.svelte';
import { ChosenBook } from './ChosenBook.svelte';
import type { BookType } from '$lib/types/book';
import type { ActiveBookType } from '$lib/types/activeBook';
import type { ChosenBookType } from '$lib/types/chosenBook';

type LibraryData = {
	books: Record<string, BookType>;
	activeBooks: Record<string, ActiveBookType>;
	chosenBooks: Record<string, ChosenBookType>;
};

class Library {
	books: Record<string, Book> = {};
	activeBooks: Record<string, ActiveBook> = {};
	chosenBooks: Record<string, ChosenBook> = {};

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

		this.chosenBooks = Object.fromEntries(
			Object.entries(data.chosenBooks).map(([id, chosenBook]) => [
				id,
				new ChosenBook(chosenBook.bookId, chosenBook.goals)
			])
		);
	}

	pagesLeftInActiveBooks = $derived(
		Object.values(this.activeBooks).reduce((total, activeBook) => {
			const book = this.books[activeBook.bookId];
			if (!book) return total;
			return total + (book.pageCount - activeBook.pagesRead);
		}, 0)
	);

	pagesLeftInChosenBooks = $derived(
		Object.values(this.chosenBooks).reduce((total, chosenBook) => {
			const book = this.books[chosenBook.bookId];
			if (!book) return total;
			return total + book.pageCount;
		}, 0)
	);
}

export function setLibrary(libraryData: LibraryData) {
	setContext('library', new Library(libraryData));
}

export function getLibrary() {
	return getContext('library') as Library;
}
