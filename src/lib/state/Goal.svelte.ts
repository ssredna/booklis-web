import { differenceInDays } from 'date-fns';
import { getLibrary } from './Library.svelte';
import { dateFormatterShort } from '$lib/dateFormatters';

export class Goal {
	id: string;
	deadline = $state(new Date().toISOString().split('T')[0]);
	numberOfBooks = $state(0);
	avgPageCount = $state(0);
	chosenBooks = $state<string[]>([]);
	activeBooks = $state<string[]>([]);
	readBooks = $state<string[]>([]);
	pagesReadToday = $state(0);

	constructor(
		id: string,
		deadline: string,
		numberOfBooks: number,
		avgPageCount: number,
		chosenBooks: string[],
		activeBooks: string[],
		readBooks: string[],
		pagesReadToday: number
	) {
		this.id = id;
		this.deadline = deadline;
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

	pagesToRead = $derived.by(() => {
		if (this.booksLeft >= this.activeBooks.length) {
			// If there are more books left than active books, read all the pages left.
			return this.totalPagesLeft;
		} else {
			// If there are more active books than books left, spread the pages left
			// evenly across the books left.
			return (this.totalPagesLeft / this.activeBooks.length) * this.booksLeft;
		}
	});

	daysLeft = $derived(differenceInDays(this.deadline, new Date()));

	pagesPerDay = $derived(Math.ceil((this.pagesToRead + this.pagesReadToday) / this.daysLeft));

	pagesPerDayTomorrow = $derived(Math.ceil(this.pagesToRead / (this.daysLeft - 1)));

	pagesLeftToday = $derived(
		Math.min(Math.max(this.pagesPerDay - this.pagesReadToday, 0), this.pagesPerDay)
	);

	books = $derived.by(() => {
		const library = getLibrary();

		const chosenBooksBookIds = this.chosenBooks.map(
			(bookId) => library.chosenBooks[bookId]?.bookId
		);
		const activeBooksBookIds = this.activeBooks.map(
			(bookId) => library.activeBooks[bookId]?.bookId
		);
		const readBooksBookIds = this.readBooks.map((bookId) => library.readBooks[bookId]?.bookId);

		const allBookIds = [...chosenBooksBookIds, ...activeBooksBookIds, ...readBooksBookIds];

		const allBooks = allBookIds
			.map((bookId) => library.books[bookId])
			.filter((book) => book !== undefined);

		return allBooks;
	});

	deadlineString = $derived(dateFormatterShort.format(new Date(this.deadline)));

	goalTitle = $derived.by(() => {
		const library = getLibrary();

		if (this.numberOfBooks === 1 && this.books.length === 1) {
			return `${this.books[0].title} til ${this.deadlineString}`;
		}

		return `${this.numberOfBooks} ${this.numberOfBooks == 1 ? 'bok' : 'bøker'} til ${this.deadlineString}`;
	});
}
