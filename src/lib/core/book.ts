export class Book {
	private _id = crypto.randomUUID();
	title;
	pages;

	constructor(title: string = '', pages: number = 0) {
		this.title = title;
		this.pages = pages;
	}

	get id() {
		return this._id;
	}
}
