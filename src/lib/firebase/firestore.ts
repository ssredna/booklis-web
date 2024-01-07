import {
	addDoc,
	collection,
	getDocs,
	deleteDoc,
	doc,
	updateDoc,
	writeBatch,
	arrayUnion,
	arrayRemove
} from 'firebase/firestore';
import { db } from './firebase';

export async function createGoal(numberOfBooks: number, deadline: Date, avgPageCount: number) {
	const docRef = await addDoc(collection(db, 'goals'), {
		numberOfBooks: numberOfBooks,
		deadline: deadline,
		avgPageCount: avgPageCount,
		pagesReadToday: 0,
		todaysDate: new Date()
	});
	return docRef.id;
}

export async function getGoals() {
	const goalSnapshot = await getDocs(collection(db, 'goals'));
	const goals = Promise.all(
		goalSnapshot.docs.map(async (goalDoc) => {
			const chosenBooks = (goalDoc.data().chosenBooks as string[]) ?? [];

			const activeBooksSnapshot = await getDocs(collection(db, 'goals', goalDoc.id, 'activeBooks'));
			const activeBooks = activeBooksSnapshot.docs.map((activeBookDoc) => {
				return {
					id: activeBookDoc.id,
					bookId: activeBookDoc.data().bookId as string,
					pagesRead: activeBookDoc.data().pagesRead as number,
					startDate: activeBookDoc.data().startDate.toDate().toString() as string
				};
			});

			const readBooksSnapshot = await getDocs(collection(db, 'goals', goalDoc.id, 'readBooks'));
			const readBooks = readBooksSnapshot.docs.map((readBookDoc) => {
				return {
					id: readBookDoc.id,
					bookId: readBookDoc.data().bookId as string,
					startDate: readBookDoc.data().startDate.toDate().toString() as string,
					endDate: readBookDoc.data().endDate.toDate().toString() as string
				};
			});

			return {
				id: goalDoc.id,
				numberOfBooks: goalDoc.data().numberOfBooks as number,
				deadline: goalDoc.data().deadline.toDate().toString() as string,
				avgPageCount: goalDoc.data().avgPageCount as number,
				pagesReadToday: goalDoc.data().pagesReadToday as number,
				todaysDate: goalDoc.data().todaysDate.toDate().toString() as string,
				chosenBooks,
				activeBooks,
				readBooks
			};
		})
	);
	return goals;
}

export async function deleteGoal(id: string) {
	await deleteDoc(doc(db, 'goals', id));
}

export async function editGoal(id: string, numberOfBooks: number, deadline: Date) {
	await updateDoc(doc(db, 'goals', id), {
		numberOfBooks: numberOfBooks,
		deadline: deadline
	});
}

export async function addBook(goalId: string, title: string, pageCount: number) {
	const batch = writeBatch(db);

	const bookRef = doc(collection(db, 'books'));
	batch.set(bookRef, {
		title: title,
		pageCount: pageCount
	});

	batch.update(doc(db, 'goals', goalId), {
		chosenBooks: arrayUnion(bookRef.id)
	});

	await batch.commit();
}

export async function addExistingBookToGoal(goalId: string, bookId: string) {
	await updateDoc(doc(db, 'goals', goalId), {
		chosenBooks: arrayUnion(bookId)
	});
}

export async function getBooks() {
	const querySnapshot = await getDocs(collection(db, 'books'));
	const books = querySnapshot.docs.map((doc) => ({
		id: doc.id,
		title: doc.data().title as string,
		pageCount: doc.data().pageCount as number
	}));
	return books;
}

export async function removeBook(goalId: string, bookId: string) {
	await updateDoc(doc(db, 'goals', goalId), {
		chosenBooks: arrayRemove(bookId)
	});
}

export async function startBook(goalId: string, bookId: string) {
	const batch = writeBatch(db);

	const activeBookRef = doc(collection(db, 'goals', goalId, 'activeBooks'));
	batch.set(activeBookRef, {
		bookId: bookId,
		pagesRead: 0,
		startDate: new Date()
	});

	batch.update(doc(db, 'goals', goalId), {
		chosenBooks: arrayRemove(bookId)
	});

	await batch.commit();
}

export async function removeActiveBook(goalId: string, activeBookId: string, bookId: string) {
	const batch = writeBatch(db);

	batch.update(doc(db, 'goals', goalId), {
		chosenBooks: arrayUnion(bookId)
	});

	batch.delete(doc(db, 'goals', goalId, 'activeBooks', activeBookId));

	await batch.commit();
}

export async function updatePagesRead(
	activeBookId: string,
	goalId: string,
	pagesRead: number,
	pagesReadToday: number
) {
	const batch = writeBatch(db);

	batch.update(doc(db, 'goals', goalId, 'activeBooks', activeBookId), {
		pagesRead: pagesRead
	});

	batch.update(doc(db, 'goals', goalId), {
		pagesReadToday: pagesReadToday,
		todaysDate: new Date()
	});

	await batch.commit();
}

export async function resetToday(goalId: string) {
	await updateDoc(doc(db, 'goals', goalId), {
		pagesReadToday: 0,
		todaysDate: new Date()
	});
}

export async function finishBook(
	goalId: string,
	activeBookId: string,
	bookId: string,
	startDate: Date
) {
	const batch = writeBatch(db);

	const readBookRef = doc(collection(db, 'goals', goalId, 'readBooks'));
	batch.set(readBookRef, {
		bookId,
		startDate,
		endDate: new Date()
	});

	batch.delete(doc(db, 'goals', goalId, 'activeBooks', activeBookId));

	await batch.commit();
}

export async function reactivateBook(
	goalId: string,
	bookId: string,
	pageCount: number,
	startDate: Date,
	readBookId: string
) {
	const batch = writeBatch(db);

	const activeBookRef = doc(collection(db, 'goals', goalId, 'activeBooks'));
	batch.set(activeBookRef, {
		bookId: bookId,
		pagesRead: pageCount,
		startDate
	});

	batch.delete(doc(db, 'goals', goalId, 'readBooks', readBookId));

	await batch.commit();
}
