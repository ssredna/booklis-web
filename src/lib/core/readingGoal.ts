import { differenceInDays, isSameDay } from 'date-fns';
import { ActiveBook } from './activeBook';
import { Book } from './book';
import { ReadBook } from './readBook';

export class ReadingGoal {
	id;
	deadline;
	numberOfBooks;
	avgPageCount;

	activeBooks: ActiveBook[] = [];
	readBooks: ReadBook[] = [];
	chosenBooks: Book[] = [];

	todaysDate = new Date();
	private _pagesReadToday;

	constructor(
		id: string,
		numberOfBooks: number,
		deadline: string,
		avgPageCount: number,
		chosenBooks: string[],
		activeBooks: { id: string; bookId: string; pagesRead: number; startDate: string }[],
		books: Book[],
		pagesReadToday?: number
	) {
		this.id = id;
		this.deadline = new Date(deadline);
		this.numberOfBooks = numberOfBooks;
		this.avgPageCount = avgPageCount;
		this._pagesReadToday = pagesReadToday ?? 0;
		this.chosenBooks = chosenBooks.map((id) => {
			const book = books.find((book) => book.id === id);
			if (book) {
				return new Book(book.id, book.title, book.pageCount);
			} else {
				return new Book('error', 'Book not found', 0);
			}
		});
		this.activeBooks = activeBooks.map((activeBook) => {
			const book = books.find((book) => book.id === activeBook.bookId);
			if (book) {
				return new ActiveBook(
					activeBook.id,
					book,
					activeBook.pagesRead,
					new Date(activeBook.startDate)
				);
			} else {
				return new ActiveBook('Error', new Book('error', 'Book not found', 0));
			}
		});
	}

	get pagesReadToday() {
		this.resetStatsOfTheDayIfNewDay();
		return this._pagesReadToday;
	}

	set pagesReadToday(amount: number) {
		this.resetStatsOfTheDayIfNewDay();
		this._pagesReadToday = Math.max(amount, 0);
	}

	pagesPerDay() {
		const daysLeft = differenceInDays(this.deadline, new Date());
		return Math.ceil(this.pagesToRead() / daysLeft);
	}

	pagesLeftToday() {
		this.resetStatsOfTheDayIfNewDay();

		return Math.min(Math.max(this.pagesPerDay() - this.pagesReadToday, 0), this.pagesPerDay());
	}

	addNewBook(newBook: Book) {
		this.chosenBooks.push(newBook);
	}

	startNewBook(newBook: Book) {
		this.activeBooks.push(new ActiveBook(crypto.randomUUID(), newBook));
	}

	pagesToRead() {
		const pagesLeftInActiveBooks = this.activeBooks.reduce(
			(pagesLeftTotal, activeBook) =>
				pagesLeftTotal + (activeBook.book.pageCount - activeBook.pagesRead),
			0
		);

		const pagesLeftInChosenBooks = this.chosenBooks.reduce(
			(pagesLeftTotal, chosenBook) => pagesLeftTotal + chosenBook.pageCount,
			0
		);

		const unknownBooksLeft =
			this.numberOfBooks -
			this.activeBooks.length -
			this.chosenBooks.length -
			this.readBooks.length;
		const pagesLetInUnknownBooks = unknownBooksLeft * this.avgPageCount;

		const totalPagesLeftInBooks =
			pagesLeftInActiveBooks + pagesLeftInChosenBooks + pagesLetInUnknownBooks;

		const numberOfBooksLeft = this.numberOfBooks - this.readBooks.length;
		if (numberOfBooksLeft >= this.activeBooks.length) {
			return totalPagesLeftInBooks;
		}

		// If we have more active books than there are books left, we want
		// to return pages to read based on average pages count.
		return (totalPagesLeftInBooks / this.activeBooks.length) * numberOfBooksLeft;
	}

	changePagesReadInBook(book: ActiveBook, newPagesRead: number) {
		const increase = newPagesRead - book.pagesRead;
		this.pagesReadToday += increase;
		book.pagesRead = newPagesRead;
	}

	finishBook(finishedBook: ActiveBook) {
		const indexOfFinishedBook = this.activeBooks.findIndex(
			(book) => book.book.id === finishedBook.book.id
		);
		this.activeBooks.splice(indexOfFinishedBook, 1);
		this.readBooks.push(new ReadBook(finishedBook.book, finishedBook.startDate));
	}

	resetStatsOfTheDayIfNewDay() {
		const today = new Date();
		if (!isSameDay(today, this.todaysDate)) {
			this.todaysDate = today;
			this._pagesReadToday = 0;
		}
	}
}
