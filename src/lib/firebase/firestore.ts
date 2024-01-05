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
	const querySnapshot = await getDocs(collection(db, 'goals'));
	const goals = querySnapshot.docs.map((doc) => ({
		id: doc.id,
		numberOfBooks: doc.data().numberOfBooks as number,
		deadline: doc.data().deadline.toDate().toString() as string,
		avgPageCount: doc.data().avgPageCount as number,
		chosenBooks: doc.data().chosenBooks as string[]
	}));
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
