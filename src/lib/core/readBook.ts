import { Book } from './book';

export class ReadBook {
	id;
	book;
	startDate;
	endDate;

	constructor(id: string, book: Book, startDate: Date, endDate = new Date()) {
		this.id = id;
		this.book = book;
		this.startDate = startDate ?? new Date();
		this.endDate = endDate;
	}
}
