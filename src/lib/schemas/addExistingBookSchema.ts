import { z } from 'zod';

export const addExistingBookSchema = z.object({
	bookId: z.string(),
	goalId: z.string()
});

export type AddExistingBookSchema = typeof addExistingBookSchema;
