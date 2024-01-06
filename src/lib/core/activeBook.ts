import { Book } from './book';

export class ActiveBook {
	book;
	private _pagesRead;
	startDate;

	constructor(book: Book, pagesRead: number = 0, startDate?: Date) {
		this.book = book;
		this.startDate = startDate ?? new Date();
		this._pagesRead = Math.min(pagesRead, book.pageCount);
	}

	get pagesRead() {
		return this._pagesRead;
	}

	set pagesRead(pagesRead) {
		this._pagesRead = Math.min(pagesRead, this.book.pageCount);
	}
}
