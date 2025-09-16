export class ActiveBook {
	bookId: string;
	pagesRead: number;
	startDate: string;
	goals: string[];

	constructor(bookId: string, pagesRead: number, startDate: string, goals: string[]) {
		this.bookId = $state(bookId);
		this.pagesRead = $state(pagesRead);
		this.startDate = $state(startDate);
		this.goals = $state(goals);
	}
}
