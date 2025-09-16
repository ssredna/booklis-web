export class ChosenBook {
	bookId: string;
	goals: string[];

	constructor(bookId: string, goals: string[]) {
		this.bookId = $state(bookId);
		this.goals = $state(goals);
	}
}
