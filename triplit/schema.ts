import { Schema as S, type ClientSchema } from '@triplit/client';

export const schema = {
	books: {
		schema: S.Schema({
			id: S.Id(),
			title: S.String(),
			totalPages: S.Number()
		})
	}
} satisfies ClientSchema;
