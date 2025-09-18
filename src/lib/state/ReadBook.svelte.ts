export class ReadBook {
	bookId: string;
	startDate: string;
	endDate: string;
	goals: string[];

	constructor(bookId: string, startDate: string, endDate: string, goals: string[]) {
		this.bookId = $state(bookId);
		this.startDate = $state(startDate);
		this.endDate = $state(endDate);
		this.goals = $state(goals);
	}
}
