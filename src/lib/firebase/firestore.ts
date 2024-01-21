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
		todaysDate: new Date()
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

		return {
			id: goalDoc.id,
			numberOfBooks: goalDoc.data().numberOfBooks as number,
			deadline: goalDoc.data().deadline.toDate().toString() as string,
			avgPageCount: goalDoc.data().avgPageCount as number,
			pagesReadToday,
			todaysDate,
			chosenBooks: (goalDoc.data().chosenBooks ?? []) as string[],
			activeBooks: (goalDoc.data().activeBooks ?? []) as string[],
			readBooks: (goalDoc.data().readBooks ?? []) as string[]
		};
	});

	return goals;
}

export async function deleteGoal(userId: string, goalId: string) {
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

export async function addBook(userId: string, goalId: string, title: string, pageCount: number) {
	const batch = writeBatch(db);

	const newBookId = crypto.randomUUID();
	batch.update(doc(db, Path.BOOKS, userId), {
		[newBookId]: {
			title: title,
			pageCount: pageCount
		}
	});

	const newChosenBookId = crypto.randomUUID();
	batch.update(doc(db, Path.CHOSEN_BOOKS, userId), {
		[newChosenBookId]: {
			bookId: newBookId,
			goals: arrayUnion(goalId)
		}
	});

	batch.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
		chosenBooks: arrayUnion(newChosenBookId)
	});

	await batch.commit();
}

export async function addExistingBookToGoal(userId: string, goalId: string, bookId: string) {
	const batch = writeBatch(db);

	const newChosenBookId = crypto.randomUUID();
	batch.update(doc(db, Path.CHOSEN_BOOKS, userId), {
		[newChosenBookId]: {
			bookId,
			goals: arrayUnion(goalId)
		}
	});

	batch.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
		chosenBooks: arrayUnion(newChosenBookId)
	});

	await batch.commit();
}

export async function getBooks(userId: string) {
	const querySnapshot = await getDoc(doc(db, Path.BOOKS, userId));
	const books = querySnapshot.data() as Record<string, Book>;

	return books ?? {};
}

export async function removeChosenBook(userId: string, goalId: string, chosenBookId: string) {
	await runTransaction(db, async (transaction) => {
		const chosenBookSnap = await transaction.get(doc(db, Path.CHOSEN_BOOKS, userId));
		const chosenBook = chosenBookSnap.data() as Record<string, ChosenBook>;
		const partOfOtherGoals = chosenBook[chosenBookId].goals.length > 1;

		transaction.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
			chosenBooks: arrayRemove(chosenBookId)
		});

		if (!partOfOtherGoals) {
			transaction.update(doc(db, Path.CHOSEN_BOOKS, userId), {
				[chosenBookId]: deleteField()
			});
		} else {
			const goalsString = `${chosenBookId}.goals`;
			transaction.update(doc(db, Path.CHOSEN_BOOKS, userId), {
				[goalsString]: arrayRemove(goalId)
			});
		}
	});
}

export async function startBook(
	userId: string,
	goalId: string,
	bookId: string,
	chosenBookId: string
) {
	await addActiveBook(userId, goalId, bookId);
	await removeChosenBook(userId, goalId, chosenBookId);
}

async function addActiveBook(
	userId: string,
	goalId: string,
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
			startDate: startDate ?? dateFormat(new Date(), 'yyyy-mm-dd')
		}
	});

	batch.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
		activeBooks: arrayUnion(newActiveBookId)
	});

	await batch.commit();
}

export async function moveBookFromActiveToChosen(
	userId: string,
	goalId: string,
	activeBookId: string,
	bookId: string
) {
	await removeActiveBook(userId, goalId, activeBookId);
	await addExistingBookToGoal(userId, goalId, bookId);
}

async function removeActiveBook(userId: string, goalId: string, activeBookId: string) {
	const goalDocs = await getDocs(collection(db, Path.GOALS, userId, 'goals'));
	await runTransaction(db, async (transaction) => {
		let count = 0;
		for (const goalDoc of goalDocs.docs) {
			const goal = await transaction.get(goalDoc.ref);
			if (goal.data()?.activeBooks.includes(activeBookId)) {
				count += 1;
			}
		}

		transaction.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
			activeBooks: arrayRemove(activeBookId)
		});

		if (count === 1) {
			transaction.update(doc(db, Path.ACTIVE_BOOKS, userId), {
				[activeBookId]: deleteField()
			});
		}
	});
}

export async function updatePagesRead(
	userId: string,
	activeBookId: string,
	goalId: string,
	pagesRead: number,
	pagesReadToday: number
) {
	const batch = writeBatch(db);

	const updateString = `${activeBookId}.pagesRead`;
	batch.update(doc(db, Path.ACTIVE_BOOKS, userId), {
		[updateString]: pagesRead
	});

	batch.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
		pagesReadToday: pagesReadToday,
		todaysDate: new Date()
	});

	await batch.commit();
}

export async function resetToday(userId: string, goalId: string) {
	await updateDoc(doc(db, Path.GOALS, userId, 'goals', goalId), {
		pagesReadToday: 0,
		todaysDate: new Date()
	});
}

export async function finishBook(
	userId: string,
	goalId: string,
	activeBookId: string,
	bookId: string,
	startDate: Date
) {
	const batch = writeBatch(db);

	const newReadBookId = crypto.randomUUID();
	batch.update(doc(db, Path.READ_BOOKS, userId), {
		[newReadBookId]: {
			bookId,
			startDate: dateFormat(startDate, 'yyyy-mm-dd'),
			endDate: dateFormat(new Date(), 'yyyy-mm-dd')
		}
	});

	batch.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
		readBooks: arrayUnion(newReadBookId)
	});

	await removeActiveBook(userId, goalId, activeBookId);

	await batch.commit();
}

export async function reactivateBook(
	userId: string,
	goalId: string,
	bookId: string,
	pageCount: number,
	startDate: Date,
	readBookId: string
) {
	await addActiveBook(userId, goalId, bookId, pageCount, dateFormat(startDate, 'yyyy-mm-dd'));
	await removeReadBook(userId, goalId, readBookId);
}

async function removeReadBook(userId: string, goalId: string, readBookId: string) {
	const goalDocs = await getDocs(collection(db, Path.GOALS, userId, 'goals'));
	await runTransaction(db, async (transaction) => {
		let count = 0;
		for (const goalDoc of goalDocs.docs) {
			const goal = await transaction.get(goalDoc.ref);
			if (goal.data()?.readBooks.includes(readBookId)) {
				count += 1;
			}
		}

		transaction.update(doc(db, Path.GOALS, userId, 'goals', goalId), {
			readBooks: arrayRemove(readBookId)
		});

		if (count === 1) {
			transaction.update(doc(db, Path.READ_BOOKS, userId), {
				[readBookId]: deleteField()
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
