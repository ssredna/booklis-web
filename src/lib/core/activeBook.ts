import { Book } from './book';

export class ActiveBook {
	id;
	book;
	private _pagesRead;
	startDate;

	constructor(id: string, book: Book, pagesRead: number = 0, startDate?: Date) {
		this.id = id;
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
