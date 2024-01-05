export class Book {
	id;
	title;
	pageCount;

	constructor(id: string, title: string, pageCount: number) {
		this.id = id;
		this.title = title;
		this.pageCount = pageCount;
	}
}
