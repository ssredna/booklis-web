import {
	addBook,
	createGoal,
	deleteGoal,
	editGoal,
	getBooks,
	getGoals,
	removeBook
} from '$lib/firebase/firestore.js';
import { fail, error } from '@sveltejs/kit';
import { z } from 'zod';

const numberOfBooksSchema = z.coerce.number().min(1);
const deadlineSchema = z.coerce.date().max(new Date('4000-01-01'));
const idSchema = z.string();
const pageCountSchema = z.coerce.number().min(1);
const titleSchema = z.coerce.string();

export const load = async () => {
	try {
		return {
			goals: await getGoals(),
			books: await getBooks()
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
		const avgPageCount = data.get('avgPageCount');

		const parsedNumberOfBooks = numberOfBooksSchema.safeParse(numberOfBooks);
		if (!parsedNumberOfBooks.success) {
			return fail(422, { numberOfBooksError: true });
		}

		const parsedDeadline = deadlineSchema.safeParse(deadline);
		if (!parsedDeadline.success) {
			return fail(422, { deadlineError: true });
		}

		const parsedAvgPageCount = pageCountSchema.safeParse(avgPageCount);
		if (!parsedAvgPageCount.success) {
			return fail(422, { avgPageCountError: true });
		}

		try {
			return await createGoal(
				parsedNumberOfBooks.data,
				parsedDeadline.data,
				parsedAvgPageCount.data
			);
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
			return fail(422, { idError: true });
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
			return fail(422, { numberOfBooksError: true });
		}

		const parsedDeadline = deadlineSchema.safeParse(deadline);
		if (!parsedDeadline.success) {
			return fail(422, { deadlineError: true });
		}

		const parsedId = idSchema.safeParse(id);
		if (!parsedId.success) {
			return fail(422, { idError: true });
		}

		try {
			return await editGoal(parsedId.data, parsedNumberOfBooks.data, parsedDeadline.data);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	},

	addBook: async ({ request }) => {
		const data = await request.formData();

		const title = data.get('title');
		const pageCount = data.get('pageCount');
		const goalId = data.get('goalId');

		const parsedTitle = titleSchema.safeParse(title);
		if (!parsedTitle.success) {
			return fail(422, { titleError: true });
		}

		const parsedPageCount = pageCountSchema.safeParse(pageCount);
		if (!parsedPageCount.success) {
			return fail(422, { pageCountError: true });
		}

		const parsedGoalId = idSchema.safeParse(goalId);
		if (!parsedGoalId.success) {
			return fail(422, { goalIdError: true });
		}

		try {
			return await addBook(parsedGoalId.data, parsedTitle.data, parsedPageCount.data);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	},

	removeBook: async ({ request }) => {
		const data = await request.formData();
		const bookId = data.get('bookId');
		const goalId = data.get('goalId');

		const parsedBookId = idSchema.safeParse(bookId);
		if (!parsedBookId.success) {
			return fail(422, { bookIdError: true });
		}

		const parsedGoalId = idSchema.safeParse(goalId);
		if (!parsedGoalId.success) {
			return fail(422, { goalIdError: true });
		}

		try {
			return await removeBook(parsedGoalId.data, parsedBookId.data);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}
};
