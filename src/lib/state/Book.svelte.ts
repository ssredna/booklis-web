export class Book {
	title: string;
	pageCount: number;

	constructor(title: string, pageCount: number) {
		this.title = $state(title);
		this.pageCount = $state(pageCount);
	}
}
