export class Book {
	private _id = crypto.randomUUID();
	title;
	pageCount;

	constructor(title: string = '', pageCount: number = 0) {
		this.title = title;
		this.pageCount = pageCount;
	}

	get id() {
		return this._id;
	}
}
