import { Book } from './book';

export class ReadBook {
	private _book;
	private _startDate;
	private _endDate;

	constructor(book: Book, startDate?: Date) {
		this._book = book;
		this._startDate = startDate ?? new Date();
		this._endDate = new Date();
	}

	get book() {
		return this._book;
	}

	get startDate() {
		return this._startDate;
	}

	get endDate() {
		return this._endDate;
	}
}
