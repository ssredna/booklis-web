export type Goal = {
	id: string;
	deadline: string;
	numberOfBooks: number;
	avgPageCount: number;
	chosenBooks: string[];
	activeBooks: { id: string; bookId: string; pagesRead: number; startDate: string }[];
	readBooks: { id: string; bookId: string; startDate: string; endDate: string }[];
	pagesReadToday: number;
};
