import { z } from 'zod';

export const editGoalSchema = z.object({
	goalId: z.string(),
	numberOfBooks: z.number().min(1, { message: 'Du må jo minst lese én bok!' }),
	deadline: z
		.date({ required_error: 'Du har ikke valgt en sluttdato.' })
		.max(new Date('3000-01-01'), { message: 'Slutt å tull, hold deg under år 3000 i alle fall.' }),
	avgPageCount: z.number().min(1, { message: 'Du må forvente at bøker ofte er på mer en én side' })
});

export type EditGoalSchema = typeof editGoalSchema;
