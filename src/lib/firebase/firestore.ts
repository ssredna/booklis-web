import { addDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export async function createGoal(numberOfBooks: number, deadline: Date) {
	const docRef = await addDoc(collection(db, 'goals'), {
		numberOfBooks: numberOfBooks,
		deadline: deadline
	});
	return docRef.id;
}

export async function getGoals() {
	const querySnapshot = await getDocs(collection(db, 'goals'));
	const goals = querySnapshot.docs.map((doc) => ({
		id: doc.id,
		numberOfBooks: doc.data().numberOfBooks as number,
		deadline: doc.data().deadline.toDate().toString() as string
	}));
	return goals;
}
