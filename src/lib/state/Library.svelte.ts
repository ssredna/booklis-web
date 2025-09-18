import { getContext, setContext } from 'svelte';
import { Book } from './Book.svelte';
import { ActiveBook } from './ActiveBook.svelte';
import { ChosenBook } from './ChosenBook.svelte';
import { ReadBook } from './ReadBook.svelte';
import { Goal } from './Goal.svelte';
import type { BookType } from '$lib/types/book';
import type { ActiveBookType } from '$lib/types/activeBook';
import type { ChosenBookType } from '$lib/types/chosenBook';
import type { GoalType } from '$lib/types/goal';
import type { ReadBookType } from '$lib/types/readBook';

type LibraryData = {
	goals: Record<string, GoalType>;
	books: Record<string, BookType>;
	activeBooks: Record<string, ActiveBookType>;
	chosenBooks: Record<string, ChosenBookType>;
	readBooks: Record<string, ReadBookType>;
};

class Library {
	books = $state<Record<string, Book>>({});
	activeBooks = $state<Record<string, ActiveBook>>({});
	chosenBooks = $state<Record<string, ChosenBook>>({});
	readBooks = $state<Record<string, ReadBook>>({});
	goals = $state<Record<string, Goal>>({});

	setLibrary(data: LibraryData) {
		this.goals = Object.fromEntries(
			Object.entries(data.goals).map(([id, goal]) => [
				id,
				new Goal(
					goal.id,
					goal.deadline,
					goal.numberOfBooks,
					goal.avgPageCount,
					goal.chosenBooks,
					goal.activeBooks,
					goal.readBooks,
					goal.pagesReadToday
				)
			])
		);

		this.books = Object.fromEntries(
			Object.entries(data.books).map(([id, book]) => [id, new Book(book.title, book.pageCount)])
		);

		this.activeBooks = Object.fromEntries(
			Object.entries(data.activeBooks).map(([id, activeBook]) => [
				id,
				new ActiveBook(
					activeBook.bookId,
					activeBook.pagesRead,
					activeBook.startDate,
					activeBook.goals
				)
			])
		);

		this.chosenBooks = Object.fromEntries(
			Object.entries(data.chosenBooks).map(([id, chosenBook]) => [
				id,
				new ChosenBook(chosenBook.bookId, chosenBook.goals)
			])
		);

		this.readBooks = Object.fromEntries(
			Object.entries(data.readBooks).map(([id, readBook]) => [
				id,
				new ReadBook(readBook.bookId, readBook.startDate, readBook.endDate, readBook.goals)
			])
		);
	}

	pagesReadToday = $derived(
		Object.values(this.goals).reduce((total, goal) => {
			return total + goal.pagesReadToday;
		}, 0)
	);
}

const LIBRARY_KEY = Symbol('library');

export function createLibrary() {
	return setContext(LIBRARY_KEY, new Library());
}

export function getLibrary() {
	return getContext<ReturnType<typeof createLibrary>>(LIBRARY_KEY);
}
