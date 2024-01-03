import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase';

export async function createGoal(numberOfBooks: number, deadline: Date) {
	const docRef = await addDoc(collection(db, 'goals'), {
		numberOfBooks: numberOfBooks,
		deadline: deadline
	});
	return docRef.id;
}
