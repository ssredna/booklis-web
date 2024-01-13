import { z } from 'zod';

export const deleteGoalSchema = z.object({
	goalId: z.string()
});

export type DeleteGoalSchema = typeof deleteGoalSchema;
