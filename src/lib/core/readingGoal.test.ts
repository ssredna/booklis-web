import { Book } from './book';
import { ReadingGoal } from './readingGoal';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { addDays, addMonths, differenceInDays } from 'date-fns';

const startOf2024 = new Date(Date.UTC(2024, 0));
const endOf2024String = '2024-12-31T00:00:00.000Z';

const shortBook = new Book('shortBook', 'Short book', 100);
const longBook = new Book('longBook', 'Long book', 1000);
const book500 = new Book('book500', 'Book 500', 500);
const book500_2 = new Book('book500_2', 'Book 500', 500);
const book500_3 = new Book('book500_3', 'Book 500', 500);

const testBooks = [shortBook, longBook, book500, book500_2, book500_3];

describe('A Reading Goal', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(startOf2024);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('create a new goal for the next year with a specified number of books, and get the pages to read', () => {
		const goal = new ReadingGoal('asdf', 12, endOf2024String, 350, [], []);

		// 12 * 350 / 365 = 11,5 -> ceil(11,5) = 12
		expect(goal.pagesPerDay()).toBe(12);
	});

	it('should be able to add a new book', () => {
		const goal = new ReadingGoal('asdf', 12, endOf2024String, 350, [], testBooks);

		goal.startNewBook(shortBook);

		expect(goal.activeBooks.length).toBe(1);
		expect(goal.activeBooks[0].book.title).toBe('Short book');
		expect(goal.activeBooks[0].book.pageCount).toBe(100);
	});

	it('should adjust reading amount after new book is added', () => {
		const goal = new ReadingGoal('asdf', 12, endOf2024String, 350, [], testBooks);

		goal.startNewBook(shortBook);
		// (11 * 350 + 100) / 365 = 10,8 -> ceil(10,8) = 11
		expect(goal.pagesPerDay()).toBe(11);

		goal.startNewBook(longBook);
		// (10 * 350 + 100 + 1000) / 365 = 12,6 -> ceil(12,6) = 13
		expect(goal.pagesPerDay()).toBe(13);
	});

	it('should show right amount of pages after finishing a book', () => {
		const goal = new ReadingGoal('asdf', 12, endOf2024String, 350, [], testBooks);
		goal.startNewBook(book500);
		goal.startNewBook(book500_2);

		goal.finishBook(goal.activeBooks[1]);
		expect(goal.activeBooks.length).toBe(1);
		// (10 * 350 + 500) / 365 = 11
		expect(goal.pagesPerDay()).toBe(11);

		goal.finishBook(goal.activeBooks[0]);
		expect(goal.activeBooks.length).toBe(0);
		// (10 * 350) / 365 = 9,6 -> ceil(9,6) = 10
		expect(goal.pagesPerDay()).toBe(10);
	});

	it('should recalculate pages to read when the date changes', () => {
		const goal = new ReadingGoal('asdf', 12, endOf2024String, 350, [], testBooks);
		expect(goal.pagesPerDay()).toBe(12);

		vi.setSystemTime(addMonths(startOf2024, 6));

		// 183 days left -> 4200 / 183 = 23
		expect(goal.pagesPerDay()).toBe(23);
	});

	it('should tell you how many pages to read today, and update when you have read some pages', () => {
		const goal = new ReadingGoal('asdf', 12, endOf2024String, 350, [], testBooks);
		expect(goal.pagesLeftToday()).toBe(12);

		goal.startNewBook(book500);
		goal.changePagesReadInBook(goal.activeBooks[0], 5);
		expect(goal.pagesReadToday).toBe(5);
		expect(goal.pagesLeftToday()).toBe(7);
		goal.changePagesReadInBook(goal.activeBooks[0], 10);
		expect(goal.pagesReadToday).toBe(10);
		expect(goal.pagesLeftToday()).toBe(2);
		goal.changePagesReadInBook(goal.activeBooks[0], 8);
		expect(goal.pagesReadToday).toBe(8);
		expect(goal.pagesLeftToday()).toBe(4);
		goal.changePagesReadInBook(goal.activeBooks[0], 12);
		expect(goal.pagesReadToday).toBe(12);
		expect(goal.pagesLeftToday()).toBe(0);
	});

	it('should not let pagesLeftToday go below 0', () => {
		const goal = new ReadingGoal('asdf', 12, endOf2024String, 350, [], testBooks);

		goal.startNewBook(book500);
		goal.changePagesReadInBook(goal.activeBooks[0], 100);
		expect(goal.pagesReadToday).toBe(100);
		expect(goal.pagesLeftToday()).toBe(0);
	});

	it('should reset stats of the day on a new day', () => {
		const goal = new ReadingGoal('asdf', 12, endOf2024String, 350, [], testBooks);
		goal.startNewBook(book500);
		goal.changePagesReadInBook(goal.activeBooks[0], 100);
		expect(goal.pagesLeftToday()).toBe(0);

		vi.setSystemTime(addDays(startOf2024, 2));

		expect(goal.pagesReadToday).toBe(0);
		expect(goal.pagesLeftToday()).toBe(12);
	});

	it('should not let pagesLeftToday go over the amount of pages to read for the day', () => {
		const goal = new ReadingGoal('asdf', 12, endOf2024String, 350, [], testBooks);
		goal.startNewBook(book500);
		goal.changePagesReadInBook(goal.activeBooks[0], 100);

		vi.setSystemTime(addDays(startOf2024, 2));

		goal.changePagesReadInBook(goal.activeBooks[0], 50);
		expect(goal.pagesLeftToday()).toBe(12);
	});

	it('should store readBooks with startDate and finishedDate', () => {
		const goal = new ReadingGoal('asdf', 12, endOf2024String, 350, [], testBooks);

		goal.startNewBook(book500);
		const endDate1 = addMonths(startOf2024, 4);
		vi.setSystemTime(endDate1);
		goal.finishBook(goal.activeBooks[0]);
		expect(differenceInDays(goal.readBooks[0].endDate, endDate1)).toBe(0);

		const endDate2 = addMonths(startOf2024, 8);
		goal.startNewBook(book500_2);
		vi.setSystemTime(endDate2);
		goal.finishBook(goal.activeBooks[0]);
		expect(differenceInDays(goal.readBooks[1].endDate, endDate2)).toBe(0);
	});

	it('should return the number of pages based on average number of pages to read if there are more active books than the goal', () => {
		const goal = new ReadingGoal('asdf', 2, endOf2024String, 350, [], testBooks);
		goal.startNewBook(book500);
		goal.startNewBook(book500_2);
		goal.startNewBook(book500_3);
		// gjennomsnitt 500 sider per bok, 2 bøker å lese, 1000 sider igjen, 3 sider om dagen istedenfor 5.
		expect(goal.pagesPerDay()).toBe(3);
	});

	it('should be able to add the same book two times to the same goal', () => {
		const goal = new ReadingGoal('asdf', 12, endOf2024String, 350, [], testBooks);
		const book = book500;
		goal.startNewBook(book);
		goal.startNewBook(book);
		expect(goal.activeBooks.length).toBe(2);
	});

	it('should calculate correctly the pages to read when choosing but not starting a book', () => {
		const goal = new ReadingGoal('asdf', 12, endOf2024String, 350, [], testBooks);
		expect(goal.pagesPerDay()).toBe(12);
		goal.addNewBook(longBook);
		// (11 * 350 + 1000) / 365 = 13.3 -> ceil(13.3) = 14
		expect(goal.pagesPerDay()).toBe(14);
	});
});
