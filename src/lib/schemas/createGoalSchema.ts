import { z } from 'zod';

export const createGoalSchema = z.object({
	numberOfBooks: z.number().min(1, { message: 'Du må jo minst lese én bok!' }),
	deadline: z
		.date({ required_error: 'Du har ikke valgt en sluttdato.' })
		.max(new Date('3000-01-01'), { message: 'Slutt å tull, hold deg under år 3000 i alle fall.' }),
	avgPageCount: z.number().min(1)
});

export type CreateGoalSchema = typeof createGoalSchema;
