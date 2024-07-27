import { client } from '$lib/client';
import { useQuery } from '@triplit/svelte';

export const getBookIds = () => {
	return useQuery(client, client.query('books').select(['id']));
};

export const getBook = (bookId: string) => {
	return useQuery(client, client.query('books').id(bookId));
};

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

export const deleteBook = async (bookId: string) => {
	return client.delete('books', bookId);
};
