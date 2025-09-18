import { getLibrary } from './Library.svelte';

export class Goal {
	id: string;
	deadline: string;
	numberOfBooks = $state(0);
	avgPageCount = $state(0);
	chosenBooks = $state<string[]>([]);
	activeBooks = $state<string[]>([]);
	readBooks = $state<string[]>([]);
	pagesReadToday = $state(0);

	constructor(
		id: string,
		deadlines: string,
		numberOfBooks: number,
		avgPageCount: number,
		chosenBooks: string[],
		activeBooks: string[],
		readBooks: string[],
		pagesReadToday: number
	) {
		this.id = id;
		this.deadline = deadlines;
		this.numberOfBooks = numberOfBooks;
		this.avgPageCount = avgPageCount;
		this.chosenBooks = chosenBooks;
		this.activeBooks = activeBooks;
		this.readBooks = readBooks;
		this.pagesReadToday = pagesReadToday;
	}

	pagesLeftInActiveBooks = $derived(
		this.activeBooks.reduce((total, activeBookId) => {
			const library = getLibrary();
			const activeBook = library.activeBooks[activeBookId];
			if (!activeBook) return total;
			const book = library.books[activeBook.bookId];
			if (!book) return total;
			return total + (book.pageCount - activeBook.pagesRead);
		}, 0)
	);

	pagesLeftInChosenBooks = $derived(
		this.chosenBooks.reduce((total, chosenBookId) => {
			const library = getLibrary();
			const chosenBook = library.chosenBooks[chosenBookId];
			if (!chosenBook) return total;
			const book = library.books[chosenBook.bookId];
			if (!book) return total;
			return total + book.pageCount;
		}, 0)
	);

	pagesLeftInUnknownBooks = $derived.by(() => {
		const pagesLeft =
			this.numberOfBooks -
			this.chosenBooks.length -
			this.activeBooks.length -
			this.readBooks.length;
		return pagesLeft > 0 ? pagesLeft * this.avgPageCount : 0;
	});

	totalPagesLeft = $derived(
		this.pagesLeftInActiveBooks + this.pagesLeftInChosenBooks + this.pagesLeftInUnknownBooks
	);

	booksLeft = $derived(this.numberOfBooks - this.readBooks.length);
}
