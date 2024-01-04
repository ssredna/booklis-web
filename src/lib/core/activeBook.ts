import { Book } from './book';

export class ActiveBook {
	private _book;
	private _pagesRead;
	private _startDate;

	constructor(book: Book, pagesRead: number = 0, startDate?: Date) {
		this._book = book;
		this._startDate = startDate ?? new Date();
		this._pagesRead = Math.min(pagesRead, book.pages);
	}

	get book() {
		return this._book;
	}

	get pagesRead() {
		return this._pagesRead;
	}

	set pagesRead(pagesRead) {
		this._pagesRead = Math.min(pagesRead, this._book.pages);
	}

	get startDate() {
		return this._startDate;
	}
}
