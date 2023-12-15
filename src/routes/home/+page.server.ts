import { createGoal } from '$lib/firebase/firestore.js';

export const actions = {
	createGoal: async ({ request }) => {
		const data = await request.formData();
		createGoal(data);
	}
};
