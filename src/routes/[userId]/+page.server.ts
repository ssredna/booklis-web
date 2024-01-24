import {
	addBook,
	addExistingBookToGoals,
	createGoal,
	deleteGoal,
	editGoal,
	moveBookFromActiveToRead,
	getActiveBooks,
	getBooks,
	getChosenBooks,
	getGoals,
	getReadBooks,
	moveBookFromActiveToChosen,
	moveBookFromReadToActive,
	removeChosenBook,
	resetToday,
	moveBookFromChosenToActive,
	updatePagesRead
} from '$lib/firebase/firestore';
import { fail, error } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms/client';
import { z } from 'zod';
import { createGoalSchema } from '$lib/schemas/createGoalSchema';
import { editGoalSchema } from '$lib/schemas/editGoalSchema';
import { deleteGoalSchema } from '$lib/schemas/deleteGoalSchema';
import { addBookSchema } from '$lib/schemas/addBookSchema';

const deadlineSchema = z.coerce.date().max(new Date('4000-01-01'));
const idSchema = z.string();
const idsSchema = z.coerce.string().array();
const pageCountSchema = z.coerce.number().min(1);
const pagesReadSchema = z.coerce.number().min(0);
const goalIdsAndPagesReadTodaySchema = z
	.object({
		goalId: idSchema,
		pagesReadToday: pagesReadSchema
	})
	.array();

export const load = async ({ locals, params }) => {
	try {
		const booksPromise = getBooks(params.userId);
		const goalsPromise = getGoals(params.userId);
		const activeBooksPromise = getActiveBooks(params.userId);
		const readBooksPromise = getReadBooks(params.userId);
		const chosenBooksPromise = getChosenBooks(params.userId);

		return {
			createGoalForm: await superValidate(createGoalSchema),
			editGoalForm: await superValidate(editGoalSchema),
			deleteGoalForm: await superValidate(deleteGoalSchema),
			addBookForm: await superValidate(addBookSchema),
			goals: await goalsPromise,
			books: await booksPromise,
			activeBooks: await activeBooksPromise,
			readBooks: await readBooksPromise,
			chosenBooks: await chosenBooksPromise,
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

		// This form can be submitted in two different variants,
		// so we also has to perform another manual check here
		if (!addBookForm.data.title || !addBookForm.data.pageCount)
			return fail(400, {
				addBookForm: {
					...addBookForm,
					valid: false,
					errors: {
						...addBookForm.errors,
						title: !addBookForm.data.title ? 'Boka må ha en tittel' : undefined,
						pageCount: !addBookForm.data.pageCount ? 'Boka må ha minst én side' : undefined
					}
				}
			});

		try {
			await addBook(
				params.userId,
				addBookForm.data.goalIds,
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
		const addBookForm = await superValidate(request, addBookSchema);

		if (!locals.isOwner)
			return fail(403, {
				addBookForm: { ...addBookForm, valid: false },
				unauthorized: true
			});
		if (!addBookForm.valid) return fail(400, { addBookForm });
		if (!addBookForm.data.bookId)
			return fail(400, {
				addBookForm: {
					...addBookForm,
					valid: false,
					errors: { bookId: 'Noe gikk galt med å legge til boken, prøv igjen senere.' }
				}
			});
		if (addBookForm.data.goalIds.length === 0)
			return fail(400, {
				addBookForm: {
					...addBookForm,
					valid: false,
					errors: {
						goalIds: {
							_errors: 'Du må velge minst ett mål som boka skal legges til'
						}
					}
				}
			});

		try {
			await addExistingBookToGoals(
				params.userId,
				addBookForm.data.goalIds,
				addBookForm.data.bookId
			);
		} catch (error) {
			return fail(400, {
				addBookForm: { ...addBookForm, valid: false },
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}

		return { addBookForm };
	},

	removeBook: async ({ request, locals, params }) => {
		if (!locals.isOwner) return fail(403, { unauthorized: true });

		const data = await request.formData();
		const chosenBookId = data.get('chosenBookId');
		const goalIds = data.getAll('goalIds');

		const parsedChosenBookId = idSchema.safeParse(chosenBookId);
		if (!parsedChosenBookId.success) {
			return fail(422, { bookIdError: true });
		}

		const parsedGoalIds = idsSchema.safeParse(goalIds);
		if (!parsedGoalIds.success) {
			return fail(422, { goalIdError: true });
		}

		try {
			return await removeChosenBook(params.userId, parsedGoalIds.data, parsedChosenBookId.data);
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
		const goalIds = data.get('goalIds');
		const chosenBookId = data.get('chosenBookId');

		const parsedBookId = idSchema.safeParse(bookId);
		if (!parsedBookId.success) {
			return fail(422, { bookIdError: true });
		}

		const parsedGoalIdsString = z.string().parse(goalIds);
		const goalIdsList = parsedGoalIdsString.split(',');
		const parsedGoalIds = idsSchema.safeParse(goalIdsList);
		if (!parsedGoalIds.success) {
			return fail(422, { goalIdError: true });
		}

		const parsedChosenBookId = idSchema.safeParse(chosenBookId);
		if (!parsedChosenBookId.success) {
			return fail(422, { chosenBookIdError: true });
		}

		try {
			return await moveBookFromChosenToActive(
				params.userId,
				parsedGoalIds.data,
				parsedBookId.data,
				parsedChosenBookId.data
			);
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
		const goalIds = data.get('goalIds');

		const parsedBookId = idSchema.safeParse(bookId);
		if (!parsedBookId.success) {
			return fail(422, { bookIdError: true });
		}

		const parsedActiveBookId = idSchema.safeParse(activeBookId);
		if (!parsedActiveBookId.success) {
			return fail(422, { activeBookIdError: true });
		}

		const parsedGoalIdsString = z.string().parse(goalIds);
		const goalIdsList = parsedGoalIdsString.split(',');
		const parsedGoalId = idsSchema.safeParse(goalIdsList);
		if (!parsedGoalId.success) {
			return fail(422, { goalIdError: true });
		}

		try {
			return await moveBookFromActiveToChosen(
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
		const pagesRead = data.get('pagesRead');
		const pagesReadToday = data.get('pagesReadToday');

		const parsedActiveBookId = idSchema.safeParse(activeBookId);
		const parsedPagesRead = pagesReadSchema.safeParse(pagesRead);

		const parsedPagesReadTodayString = z.string().parse(pagesReadToday);
		const goalIdsAndPagesReadToday = parsedPagesReadTodayString
			.split(';')
			.map((goalIdAndPagesReadToday) => {
				const [goalId, pagesReadToday] = goalIdAndPagesReadToday.split(',');
				return { goalId, pagesReadToday: Number(pagesReadToday) };
			});
		const parsedGoalIdsAndPagesReadToday =
			goalIdsAndPagesReadTodaySchema.safeParse(goalIdsAndPagesReadToday);

		if (
			!parsedPagesRead.success ||
			!parsedActiveBookId.success ||
			!parsedGoalIdsAndPagesReadToday.success
		) {
			return fail(422, { updatePagesReadError: true });
		}

		try {
			return await updatePagesRead(
				params.userId,
				parsedActiveBookId.data,
				parsedGoalIdsAndPagesReadToday.data,
				parsedPagesRead.data
			);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	},

	resetToday: async ({ locals, params }) => {
		if (!locals.isOwner) return fail(403, { unauthorized: true });

		try {
			return await resetToday(params.userId);
		} catch (error) {
			return fail(400, {
				fireBaseError: error instanceof Error ? error.message : 'Unknown error'
			});
		}
	},

	finishBook: async ({ request, locals, params }) => {
		if (!locals.isOwner) return fail(403, { unauthorized: true });

		const data = await request.formData();

		const goalIds = data.get('goalIds');
		const activeBookId = data.get('activeBookId');
		const bookId = data.get('bookId');
		const startDate = data.get('startDate');

		const parsedGoalIdsString = z.string().parse(goalIds);
		const goalIdsList = parsedGoalIdsString.split(',');
		const parsedGoalIds = idsSchema.safeParse(goalIdsList);
		const parsedActiveBookId = idSchema.safeParse(activeBookId);
		const parsedBookId = idSchema.safeParse(bookId);
		const parsedStartDate = deadlineSchema.safeParse(startDate);

		if (
			!parsedGoalIds.success ||
			!parsedActiveBookId.success ||
			!parsedBookId.success ||
			!parsedStartDate.success
		) {
			return fail(422, { finishBookError: true });
		}

		try {
			await moveBookFromActiveToRead(
				params.userId,
				parsedGoalIds.data,
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

		const goalIds = data.get('goalIds');
		const bookId = data.get('bookId');
		const readBookId = data.get('readBookId');
		const startDate = data.get('startDate');
		const pageCount = data.get('pageCount');

		const parsedGoalIdsString = z.string().parse(goalIds);
		const goalIdsList = parsedGoalIdsString.split(',');
		const parsedGoalIds = idsSchema.safeParse(goalIdsList);
		const parsedBookId = idSchema.safeParse(bookId);
		const parsedReadBookId = idSchema.safeParse(readBookId);
		const parsedStartDate = deadlineSchema.safeParse(startDate);
		const parsedPageCount = pageCountSchema.safeParse(pageCount);

		if (
			!parsedGoalIds.success ||
			!parsedReadBookId.success ||
			!parsedBookId.success ||
			!parsedStartDate.success ||
			!parsedPageCount.success
		) {
			return fail(422, { reactivateBookError: true });
		}

		try {
			await moveBookFromReadToActive(
				params.userId,
				parsedGoalIds.data,
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
