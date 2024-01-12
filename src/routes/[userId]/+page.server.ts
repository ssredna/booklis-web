import {
	addBook,
	addExistingBookToGoal,
	createGoal,
	deleteGoal,
	editGoal,
	finishBook,
	getBooks,
	getGoals,
	reactivateBook,
	removeActiveBook,
	removeBook,
	resetToday,
	startBook,
	updatePagesRead
} from '$lib/firebase/firestore.js';
import { fail, error } from '@sveltejs/kit';
import { isSameDay } from 'date-fns';
import { superValidate } from 'sveltekit-superforms/client';
import { z } from 'zod';
import { createGoalSchema } from './createGoalSchema';
import { editGoalSchema } from './editGoalSchema';
import { deleteGoalSchema } from './deleteGoalSchema';
import { addBookSchema } from './addBookSchema';

const deadlineSchema = z.coerce.date().max(new Date('4000-01-01'));
const idSchema = z.string();
const pageCountSchema = z.coerce.number().min(1);
const pagesReadSchema = z.coerce.number().min(0);

export const load = async ({ locals, params }) => {
	try {
		const goals = await getGoals(params.userId);
		const today = new Date();
		goals.forEach((goal) => {
			if (!isSameDay(today, new Date(goal.todaysDate))) {
				goal.todaysDate = today.toString();
				goal.pagesReadToday = 0;
			}
		});
		return {
			createGoalForm: await superValidate(createGoalSchema),
			editGoalForm: await superValidate(editGoalSchema),
			deleteGoalForm: await superValidate(deleteGoalSchema),
			addBookForm: await superValidate(addBookSchema),
			goals,
			books: await getBooks(params.userId),
			isOwner: locals.isOwner
		};
	} catch (e) {
		error(500, e instanceof Error ? e.message : 'Unknown error');
	}
};

export const actions = {
	createGoal: async (event) => {
		const createGoalForm = await superValidate(event.request, createGoalSchema);

		if (!event.locals.isOwner) return fail(403, { createGoalForm, unauthorized: true });
		if (!createGoalForm.valid) return fail(400, { createGoalForm });

		try {
			await createGoal(
				event.params.userId,
				createGoalForm.data.numberOfBooks,
				createGoalForm.data.deadline,
				createGoalForm.data.avgPageCount
			);
		} catch (error) {
			return fail(400, {
				createGoalForm,
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}

		return { createGoalForm };
	},

	deleteGoal: async ({ request, locals, params }) => {
		const deleteGoalForm = await superValidate(request, deleteGoalSchema);

		if (!locals.isOwner) return fail(403, { deleteGoalForm, unauthorized: true });
		if (!deleteGoalForm.valid) return fail(400, { deleteGoalForm });

		try {
			await deleteGoal(params.userId, deleteGoalForm.data.goalId);
		} catch (error) {
			return fail(400, {
				deleteGoalForm,
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}

		return { deleteGoalForm };
	},

	editGoal: async ({ request, locals, params }) => {
		const editGoalForm = await superValidate(request, editGoalSchema);

		if (!locals.isOwner) return fail(403, { editGoalForm, unauthorized: true });
		if (!editGoalForm.valid) return fail(400, { editGoalForm });

		try {
			await editGoal(
				params.userId,
				editGoalForm.data.goalId,
				editGoalForm.data.numberOfBooks,
				editGoalForm.data.deadline,
				editGoalForm.data.avgPageCount
			);
		} catch (error) {
			return fail(400, {
				editGoalForm,
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}

		return { editGoalForm };
	},

	addBook: async ({ request, locals, params }) => {
		const addBookForm = await superValidate(request, addBookSchema);

		if (!locals.isOwner)
			return fail(403, { addBookForm: { ...addBookForm, valid: false }, unauthorized: true });
		if (!addBookForm.valid) return fail(400, { addBookForm });

		try {
			await addBook(
				params.userId,
				addBookForm.data.goalId,
				addBookForm.data.title,
				addBookForm.data.pageCount
			);
		} catch (error) {
			return fail(400, {
				addBookForm: { ...addBookForm, valid: false },
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}

		return { addBookForm };
	},

	addExistingBook: async ({ request, locals, params }) => {
		if (!locals.isOwner) return fail(403, { unauthorized: true });

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
			return await addExistingBookToGoal(params.userId, parsedGoalId.data, parsedBookId.data);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	},

	removeBook: async ({ request, locals, params }) => {
		if (!locals.isOwner) return fail(403, { unauthorized: true });

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
			return await removeBook(params.userId, parsedGoalId.data, parsedBookId.data);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	},

	startBook: async ({ request, locals, params }) => {
		if (!locals.isOwner) return fail(403, { unauthorized: true });

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
			return await startBook(params.userId, parsedGoalId.data, parsedBookId.data);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	},

	removeActiveBook: async ({ request, locals, params }) => {
		if (!locals.isOwner) return fail(403, { unauthorized: true });

		const data = await request.formData();
		const bookId = data.get('bookId');
		const activeBookId = data.get('activeBookId');
		const goalId = data.get('goalId');

		const parsedBookId = idSchema.safeParse(bookId);
		if (!parsedBookId.success) {
			return fail(422, { bookIdError: true });
		}

		const parsedActiveBookId = idSchema.safeParse(activeBookId);
		if (!parsedActiveBookId.success) {
			return fail(422, { activeBookIdError: true });
		}

		const parsedGoalId = idSchema.safeParse(goalId);
		if (!parsedGoalId.success) {
			return fail(422, { goalIdError: true });
		}

		try {
			return await removeActiveBook(
				params.userId,
				parsedGoalId.data,
				parsedActiveBookId.data,
				parsedBookId.data
			);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	},

	updatePagesRead: async ({ request, locals, params }) => {
		if (!locals.isOwner) return fail(403, { unauthorized: true });

		const data = await request.formData();

		const activeBookId = data.get('activeBookId');
		const goalId = data.get('goalId');
		const pagesRead = data.get('pagesRead');
		const pagesReadToday = data.get('pagesReadToday');

		const parsedActiveBookId = idSchema.safeParse(activeBookId);
		const parsedGoalId = idSchema.safeParse(goalId);
		const parsedPagesRead = pagesReadSchema.safeParse(pagesRead);
		const parsedPagesReadToday = pagesReadSchema.safeParse(pagesReadToday);

		if (
			!parsedGoalId.success ||
			!parsedPagesRead.success ||
			!parsedActiveBookId.success ||
			!parsedPagesReadToday.success
		) {
			return fail(422, { updatePagesReadError: true });
		}

		try {
			return await updatePagesRead(
				params.userId,
				parsedActiveBookId.data,
				parsedGoalId.data,
				parsedPagesRead.data,
				parsedPagesReadToday.data
			);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	},

	resetToday: async ({ request, locals, params }) => {
		if (!locals.isOwner) return fail(403, { unauthorized: true });

		const data = await request.formData();

		const goalId = data.get('goalId');

		const parsedGoalId = idSchema.safeParse(goalId);
		if (!parsedGoalId.success) {
			return fail(422, { resetTodayError: true });
		}

		try {
			return await resetToday(params.userId, parsedGoalId.data);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	},

	finishBook: async ({ request, locals, params }) => {
		if (!locals.isOwner) return fail(403, { unauthorized: true });

		const data = await request.formData();

		const goalId = data.get('goalId');
		const activeBookId = data.get('activeBookId');
		const bookId = data.get('bookId');
		const startDate = data.get('startDate');

		const parsedGoalId = idSchema.safeParse(goalId);
		const parsedActiveBookId = idSchema.safeParse(activeBookId);
		const parsedBookId = idSchema.safeParse(bookId);
		const parsedStartDate = deadlineSchema.safeParse(startDate);

		if (
			!parsedGoalId.success ||
			!parsedActiveBookId.success ||
			!parsedBookId.success ||
			!parsedStartDate.success
		) {
			return fail(422, { finishBookError: true });
		}

		try {
			await finishBook(
				params.userId,
				parsedGoalId.data,
				parsedActiveBookId.data,
				parsedBookId.data,
				parsedStartDate.data
			);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	},

	reactivateBook: async ({ request, locals, params }) => {
		if (!locals.isOwner) return fail(403, { unauthorized: true });

		const data = await request.formData();

		const goalId = data.get('goalId');
		const bookId = data.get('bookId');
		const readBookId = data.get('readBookId');
		const startDate = data.get('startDate');
		const pageCount = data.get('pageCount');

		const parsedGoalId = idSchema.safeParse(goalId);
		const parsedBookId = idSchema.safeParse(bookId);
		const parsedReadBookId = idSchema.safeParse(readBookId);
		const parsedStartDate = deadlineSchema.safeParse(startDate);
		const parsedPageCount = pageCountSchema.safeParse(pageCount);

		if (
			!parsedGoalId.success ||
			!parsedReadBookId.success ||
			!parsedBookId.success ||
			!parsedStartDate.success ||
			!parsedPageCount.success
		) {
			return fail(422, { reactivateBookError: true });
		}

		try {
			await reactivateBook(
				params.userId,
				parsedGoalId.data,
				parsedBookId.data,
				parsedPageCount.data,
				parsedStartDate.data,
				parsedReadBookId.data
			);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	}
};
