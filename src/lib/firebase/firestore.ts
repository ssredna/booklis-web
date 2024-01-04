import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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
		avgPageCount: doc.data().avgPageCount as number
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
