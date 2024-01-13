import { z } from 'zod';

export const addBookSchema = z.object({
	title: z.string().min(1, { message: 'Boka må ha et navn' }),
	pageCount: z.number().min(1, { message: 'Boka må ha minst én side' }),
	goalId: z.string()
});

export type AddBookSchema = typeof addBookSchema;
