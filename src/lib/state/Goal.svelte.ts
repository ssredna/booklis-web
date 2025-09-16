import { getLibrary } from './Library.svelte';

export class Goal {
	id: string;
	deadline: string;
	numberOfBooks: number = 0;
	avgPageCount: number = 0;
	chosenBooks: string[] = [];
	activeBooks: string[] = [];
	readBooks: string[] = [];
	pagesReadToday: number = 0;

	constructor(
		id: string,
		deadlines: string,
		numberOfBooks: number,
		avgPageCount: number,
		chosenBooks: string[],
		activeBooks: string[],
		readBooks: string[],
		pagesReadToday: number
	) {
		this.id = $state(id);
		this.deadline = $state(deadlines);
		this.numberOfBooks = $state(numberOfBooks);
		this.avgPageCount = $state(avgPageCount);
		this.chosenBooks = $state(chosenBooks);
		this.activeBooks = $state(activeBooks);
		this.readBooks = $state(readBooks);
		this.pagesReadToday = $state(pagesReadToday);
	}

	pagesLeftInActiveBooks = $derived(
		this.activeBooks.reduce((total, activeBookId) => {
			const book = getLibrary().books[activeBookId];
			if (!book) return total;
			return total + (book.pageCount - getLibrary().activeBooks[activeBookId].pagesRead);
		}, 0)
	);

	pagesLeftInChosenBooks = $derived(
		Object.values(this.chosenBooks).reduce((total, chosenBookId) => {
			const book = getLibrary().books[chosenBookId];
			if (!book) return total;
			return total + book.pageCount;
		}, 0)
	);

	pagesLeftInUnknownBooks = $derived.by(() => {
		const pagesLeft =
			this.numberOfBooks -
			this.chosenBooks.length -
			this.activeBooks.length -
			this.readBooks.length;
		return pagesLeft > 0 ? pagesLeft * this.avgPageCount : 0;
	});
}
