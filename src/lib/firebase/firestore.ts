import {
	addDoc,
	collection,
	getDocs,
	deleteDoc,
	doc,
	updateDoc,
	writeBatch,
	arrayUnion,
	arrayRemove,
	getDoc,
	runTransaction,
	deleteField,
	setDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { isSameDay } from 'date-fns';
import type { ActiveBook } from '$lib/types/activeBook';
import type { ReadBook } from '$lib/types/readBook';
import type { Book } from '$lib/types/book';
import dateFormat from 'dateformat';
import type { ChosenBook } from '$lib/types/chosenBook';
import type { Goal } from '$lib/types/goal';

enum Path {
	ACTIVE_BOOKS = 'activeBooks',
	READ_BOOKS = 'readBooks',
	CHOSEN_BOOKS = 'chosenBooks',
	BOOKS = 'books',
	GOALS = 'goals'
}

async function createBookDocumentsIfTheyDontExist(userId: string) {
	const booksRef = doc(db, Path.BOOKS, userId);
	const booksSnap = await getDoc(booksRef);
	if (!booksSnap.exists()) {
		await setDoc(booksRef, {});
	}

	const chosenBooksRef = doc(db, Path.CHOSEN_BOOKS, userId);
	const chosenBooksSnap = await getDoc(chosenBooksRef);
	if (!chosenBooksSnap.exists()) {
		await setDoc(chosenBooksRef, {});
	}

	const activeBooksRef = doc(db, Path.ACTIVE_BOOKS, userId);
	const activeBooksSnap = await getDoc(activeBooksRef);
	if (!activeBooksSnap.exists()) {
		await setDoc(activeBooksRef, {});
	}

	const readBooksRef = doc(db, Path.READ_BOOKS, userId);
	const readBooksSnap = await getDoc(readBooksRef);
	if (!readBooksSnap.exists()) {
		await setDoc(readBooksRef, {});
	}
}

export async function createGoal(
	userId: string,
	numberOfBooks: number,
	deadline: Date,
	avgPageCount: number
) {
	await addDoc(collection(db, Path.GOALS, userId, 'goals'), {
		userId,
		numberOfBooks,
		deadline,
		avgPageCount,
		pagesReadToday: 0,
		todaysDate: new Date(),
		chosenBooks: [],
		activeBooks: [],
		readBooks: []
	});
	await createBookDocumentsIfTheyDontExist(userId);
}

export async function getGoals(userId: string) {
	const goalsSnapshot = await getDocs(collection(db, Path.GOALS, userId, 'goals'));
	const goals = goalsSnapshot.docs.map((goalDoc) => {
		const today = new Date();
		const whatTheGoalThinkIsToday = goalDoc.data().todaysDate.toDate();

		let todaysDate = today.toString();
		let pagesReadToday = 0;
		if (isSameDay(today, whatTheGoalThinkIsToday)) {
			todaysDate = whatTheGoalThinkIsToday.toString();
			pagesReadToday = goalDoc.data().pagesReadToday as number;
		}

		return [
			goalDoc.id,
			{
				id: goalDoc.id,
				numberOfBooks: goalDoc.data().numberOfBooks as number,
				deadline: goalDoc.data().deadline.toDate().toString() as string,
				avgPageCount: goalDoc.data().avgPageCount as number,
				pagesReadToday,
				todaysDate,
				chosenBooks: (goalDoc.data().chosenBooks ?? []) as string[],
				activeBooks: (goalDoc.data().activeBooks ?? []) as string[],
				readBooks: (goalDoc.data().readBooks ?? []) as string[]
			}
		];
	});

	return Object.fromEntries(goals) as Record<string, Goal>;
}

export async function deleteGoal(userId: string, goalId: string) {
	const goalDoc = await getDoc(doc(db, Path.GOALS, userId, 'goals', goalId));

	const chosenBooks = goalDoc.data()?.chosenBooks as string[];
	const activeBooks = goalDoc.data()?.activeBooks as string[];
	const readBooks = goalDoc.data()?.readBooks as string[];

	const promises: Promise<void>[] = [];

	for (const chosenBookId of chosenBooks) {
		promises.push(removeChosenBook(userId, [goalId], chosenBookId));
	}

	for (const activeBookId of activeBooks) {
		promises.push(removeActiveBook(userId, [goalId], activeBookId));
	}

	for (const readBookId of readBooks) {
		promises.push(removeReadBook(userId, [goalId], readBookId));
	}

	await Promise.all(promises);

	await deleteDoc(doc(db, Path.GOALS, userId, 'goals', goalId));
}

export async function editGoal(
	userId: string,
	goalId: string,
	numberOfBooks: number,
	deadline: Date,
	avgPageCount: number
) {
	await updateDoc(doc(db, Path.GOALS, userId, 'goals', goalId), {
		numberOfBooks,
		deadline,
		avgPageCount
	});
}

export async function addBook(userId: string, goalIds: string[], title: string, pageCount: number) {
	const batch = writeBatch(db);

	const newBookId = crypto.randomUUID();
	batch.update(doc(db, Path.BOOKS, userId), {
		[newBookId]: {
			title: title,
			pageCount: pageCount
		}
	});

	if (goalIds.length > 0) {
		const newChosenBookId = crypto.randomUUID();
		batch.update(doc(db, Path.CHOSEN_BOOKS, userId), {
			[newChosenBookId]: {
				bookId: newBookId,
				goals: arrayUnion(...goalIds)
			}
		});

		for (const goalId of goalIds) {
			batch.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
				chosenBooks: arrayUnion(newChosenBookId)
			});
		}
	}

	await batch.commit();
}

export async function addExistingBookToGoals(userId: string, goalIds: string[], bookId: string) {
	const batch = writeBatch(db);

	const newChosenBookId = crypto.randomUUID();
	batch.update(doc(db, Path.CHOSEN_BOOKS, userId), {
		[newChosenBookId]: {
			bookId,
			goals: arrayUnion(...goalIds)
		}
	});

	for (const goalId of goalIds) {
		batch.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
			chosenBooks: arrayUnion(newChosenBookId)
		});
	}

	await batch.commit();
}

export async function getBooks(userId: string) {
	const querySnapshot = await getDoc(doc(db, Path.BOOKS, userId));
	const books = querySnapshot.data() as Record<string, Book>;

	return books ?? {};
}

export async function removeChosenBook(userId: string, goalIds: string[], chosenBookId: string) {
	await runTransaction(db, async (transaction) => {
		const chosenBookSnap = await transaction.get(doc(db, Path.CHOSEN_BOOKS, userId));
		const chosenBook = chosenBookSnap.data() as Record<string, ChosenBook>;
		const partOfOtherGoals = chosenBook[chosenBookId].goals.length > goalIds.length;

		for (const goalId of goalIds) {
			transaction.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
				chosenBooks: arrayRemove(chosenBookId)
			});
		}

		if (!partOfOtherGoals) {
			transaction.update(doc(db, Path.CHOSEN_BOOKS, userId), {
				[chosenBookId]: deleteField()
			});
		} else {
			const goalsString = `${chosenBookId}.goals`;
			transaction.update(doc(db, Path.CHOSEN_BOOKS, userId), {
				[goalsString]: arrayRemove(...goalIds)
			});
		}
	});
}

export async function moveBookFromChosenToActive(
	userId: string,
	goalIds: string[],
	bookId: string,
	chosenBookId: string
) {
	await addActiveBook(userId, goalIds, bookId);
	await removeChosenBook(userId, goalIds, chosenBookId);
}

async function addActiveBook(
	userId: string,
	goalIds: string[],
	bookId: string,
	pagesRead?: number,
	startDate?: string
) {
	const batch = writeBatch(db);

	const newActiveBookId = crypto.randomUUID();
	batch.update(doc(db, Path.ACTIVE_BOOKS, userId), {
		[newActiveBookId]: {
			bookId,
			pagesRead: pagesRead ?? 0,
			startDate: startDate ?? dateFormat(new Date(), 'yyyy-mm-dd'),
			goals: goalIds
		}
	});

	for (const goalId of goalIds) {
		batch.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
			activeBooks: arrayUnion(newActiveBookId)
		});
	}

	await batch.commit();
}

export async function moveBookFromActiveToChosen(
	userId: string,
	goalIds: string[],
	activeBookId: string,
	bookId: string
) {
	await removeActiveBook(userId, goalIds, activeBookId);
	await addExistingBookToGoals(userId, goalIds, bookId);
}

async function removeActiveBook(userId: string, goalIds: string[], activeBookId: string) {
	await runTransaction(db, async (transaction) => {
		const activeBookSnap = await transaction.get(doc(db, Path.ACTIVE_BOOKS, userId));
		const activeBook = activeBookSnap.data() as Record<string, ActiveBook>;
		const partOfOtherGoals = activeBook[activeBookId].goals.length > goalIds.length;

		for (const goalId of goalIds) {
			transaction.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
				activeBooks: arrayRemove(activeBookId)
			});
		}

		if (!partOfOtherGoals) {
			transaction.update(doc(db, Path.ACTIVE_BOOKS, userId), {
				[activeBookId]: deleteField()
			});
		} else {
			const goalsString = `${activeBookId}.goals`;
			transaction.update(doc(db, Path.ACTIVE_BOOKS, userId), {
				[goalsString]: arrayRemove(...goalIds)
			});
		}
	});
}

export async function updatePagesRead(
	userId: string,
	activeBookId: string,
	goalIdsAndPagesReadToday: {
		goalId: string;
		pagesReadToday: number;
	}[],
	pagesRead: number
) {
	const batch = writeBatch(db);

	const updateString = `${activeBookId}.pagesRead`;
	batch.update(doc(db, Path.ACTIVE_BOOKS, userId), {
		[updateString]: pagesRead
	});

	for (const goalIdAndPageReadToday of goalIdsAndPagesReadToday) {
		batch.update(doc(db, Path.GOALS, userId, 'goals', goalIdAndPageReadToday.goalId), {
			pagesReadToday: goalIdAndPageReadToday.pagesReadToday,
			todaysDate: new Date()
		});
	}

	await batch.commit();
}

export async function resetToday(userId: string) {
	const batch = writeBatch(db);

	const goalsSnap = await getDocs(collection(db, Path.GOALS, userId, 'goals'));

	for (const goalSnap of goalsSnap.docs) {
		batch.update(goalSnap.ref, {
			pagesReadToday: 0,
			todaysDate: new Date()
		});
	}

	await batch.commit();
}

export async function moveBookFromActiveToRead(
	userId: string,
	goalIds: string[],
	activeBookId: string,
	bookId: string,
	startDate: Date
) {
	await addReadBook(userId, goalIds, bookId, startDate);
	await removeActiveBook(userId, goalIds, activeBookId);
}

async function addReadBook(userId: string, goalIds: string[], bookId: string, startDate: Date) {
	const batch = writeBatch(db);

	const newReadBookId = crypto.randomUUID();
	batch.update(doc(db, Path.READ_BOOKS, userId), {
		[newReadBookId]: {
			bookId,
			startDate: dateFormat(startDate, 'yyyy-mm-dd'),
			endDate: dateFormat(new Date(), 'yyyy-mm-dd'),
			goals: goalIds
		}
	});

	for (const goalId of goalIds) {
		batch.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
			readBooks: arrayUnion(newReadBookId)
		});
	}

	await batch.commit();
}

export async function moveBookFromReadToActive(
	userId: string,
	goalIds: string[],
	bookId: string,
	pageCount: number,
	startDate: Date,
	readBookId: string
) {
	await addActiveBook(userId, goalIds, bookId, pageCount, dateFormat(startDate, 'yyyy-mm-dd'));
	await removeReadBook(userId, goalIds, readBookId);
}

async function removeReadBook(userId: string, goalIds: string[], readBookId: string) {
	await runTransaction(db, async (transaction) => {
		const readBookSnap = await transaction.get(doc(db, Path.READ_BOOKS, userId));
		const readBook = readBookSnap.data() as Record<string, ReadBook>;
		const partOfOtherGoals = readBook[readBookId].goals.length > goalIds.length;

		for (const goalId of goalIds) {
			transaction.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
				readBooks: arrayRemove(readBookId)
			});
		}

		if (!partOfOtherGoals) {
			transaction.update(doc(db, Path.READ_BOOKS, userId), {
				[readBookId]: deleteField()
			});
		} else {
			const goalsString = `${readBookId}.goals`;
			transaction.update(doc(db, Path.READ_BOOKS, userId), {
				[goalsString]: arrayRemove(...goalIds)
			});
		}
	});
}

export async function getActiveBooks(userId: string) {
	const querySnapshot = await getDoc(doc(db, Path.ACTIVE_BOOKS, userId));
	const activeBooks = querySnapshot.data() as Record<string, ActiveBook>;

	return activeBooks ?? {};
}

export async function getReadBooks(userId: string) {
	const querySnapshot = await getDoc(doc(db, Path.READ_BOOKS, userId));
	const readBooks = querySnapshot.data() as Record<string, ReadBook>;

	return readBooks ?? {};
}

export async function getChosenBooks(userId: string) {
	const querySnapshot = await getDoc(doc(db, Path.CHOSEN_BOOKS, userId));
	const chosenBooks = querySnapshot.data() as Record<string, ChosenBook>;

	return chosenBooks ?? {};
}
