import { createGoal, getGoals } from '$lib/firebase/firestore.js';
import { fail, error } from '@sveltejs/kit';
import { z } from 'zod';

export const load = async () => {
	try {
		return {
			goals: await getGoals()
		};
	} catch (e) {
		error(400, e instanceof Error ? e.message : 'Unknown error');
	}
};

export const actions = {
	createGoal: async ({ request }) => {
		const data = await request.formData();

		const numberOfBooks = data.get('numberOfBooks');
		const deadline = data.get('deadline');

		const numSchema = z.coerce.number().min(1);
		const dateSchema = z.coerce.date().max(new Date('4000-01-01'));

		const parsedNumberOfBooks = numSchema.safeParse(numberOfBooks);
		if (!parsedNumberOfBooks.success) {
			return fail(422, {
				numberOfBooksError: true
			});
		}

		const parsedDeadline = dateSchema.safeParse(deadline);
		if (!parsedDeadline.success) {
			return fail(422, {
				deadlineError: true
			});
		}

		try {
			return await createGoal(parsedNumberOfBooks.data, parsedDeadline.data);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}
};
