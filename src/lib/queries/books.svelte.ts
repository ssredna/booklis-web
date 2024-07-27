import { client } from '$lib/client';

export const myBooksQuery = client.query('books').select(['id']);

export const updateBookTitle = async (bookId: string, newTitle: string) => {
	return client.update('books', bookId, async (book) => {
		book.title = newTitle;
	});
};

export const updateBookTotalPages = async (bookId: string, newTotalPages: number) => {
	return client.update('books', bookId, async (book) => {
		book.totalPages = newTotalPages;
	});
};
