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
		avgPageCount: avgPageCount
	});
	return docRef.id;
}

export async function getGoals() {
	const goalSnapshot = await getDocs(collection(db, 'goals'));
	const goals = Promise.all(
		goalSnapshot.docs.map(async (goalDoc) => {
			const activeBooksSnapshot = await getDocs(collection(db, 'goals', goalDoc.id, 'activeBooks'));
			const activeBooks = activeBooksSnapshot.docs.map((activeBookDoc) => {
				return {
					bookId: activeBookDoc.data().bookId as string,
					pagesRead: activeBookDoc.data().pagesRead as number,
					startDate: activeBookDoc.data().startDate.toDate().toString() as string
				};
			});

			return {
				id: goalDoc.id,
				numberOfBooks: goalDoc.data().numberOfBooks as number,
				deadline: goalDoc.data().deadline.toDate().toString() as string,
				avgPageCount: goalDoc.data().avgPageCount as number,
				chosenBooks: goalDoc.data().chosenBooks as string[],
				activeBooks
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
