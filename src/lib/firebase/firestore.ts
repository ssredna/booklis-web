import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebase';

export async function createGoal(data) {
	try {
		const docRef = await addDoc(collection(db, 'goals'), {
			numberOfBooks: data.get('numberOfBooks')
		});
		console.log('Document written with ID: ', docRef.id);
	} catch (e) {
		console.error('Error adding document: ', e);
	}
}
