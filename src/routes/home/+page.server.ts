import { createGoal, deleteGoal, editGoal, getGoals } from '$lib/firebase/firestore.js';
import { fail, error } from '@sveltejs/kit';
import { z } from 'zod';

const numberOfBooksSchema = z.coerce.number().min(1);
const deadlineSchema = z.coerce.date().max(new Date('4000-01-01'));
const idSchema = z.string();

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

		const parsedNumberOfBooks = numberOfBooksSchema.safeParse(numberOfBooks);
		if (!parsedNumberOfBooks.success) {
			return fail(422, {
				numberOfBooksError: true
			});
		}

		const parsedDeadline = deadlineSchema.safeParse(deadline);
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
	},

	deleteGoal: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id');

		const parsedId = idSchema.safeParse(id);
		if (!parsedId.success) {
			return fail(422, {
				idError: true
			});
		}

		try {
			return await deleteGoal(parsedId.data);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	},

	editGoal: async ({ request }) => {
		const data = await request.formData();

		const numberOfBooks = data.get('numberOfBooks');
		const deadline = data.get('deadline');
		const id = data.get('id');

		const parsedNumberOfBooks = numberOfBooksSchema.safeParse(numberOfBooks);
		if (!parsedNumberOfBooks.success) {
			return fail(422, {
				numberOfBooksError: true
			});
		}

		const parsedDeadline = deadlineSchema.safeParse(deadline);
		if (!parsedDeadline.success) {
			return fail(422, {
				deadlineError: true
			});
		}

		const parsedId = idSchema.safeParse(id);
		if (!parsedId.success) {
			return fail(422, {
				idError: true
			});
		}

		try {
			return await editGoal(parsedId.data, parsedNumberOfBooks.data, parsedDeadline.data);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}
};
