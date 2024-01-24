import { z } from 'zod';

export const addBookSchema = z.object({
	goalIds: z.string().array(),
	title: z.string().min(1, { message: 'Boka må ha et navn' }).optional(),
	pageCount: z.number().min(1, { message: 'Boka må ha minst én side' }).optional(),
	bookId: z.string().optional()
});

export type AddBookSchema = typeof addBookSchema;
