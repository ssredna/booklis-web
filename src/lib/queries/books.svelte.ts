import { client } from '$lib/client';
import { useQuery } from '@triplit/svelte';

export function getBookIds() {
	return useQuery(client, client.query('books').select(['id']));
}

export function getBook(bookId: string) {
	return useQuery(client, client.query('books').id(bookId));
}

export async function updateBookTitle(bookId: string, newTitle: string) {
	return client.update('books', bookId, async (book) => {
		book.title = newTitle;
	});
}

export async function updateBookTotalPages(bookId: string, newTotalPages: number) {
	return client.update('books', bookId, async (book) => {
		book.totalPages = newTotalPages;
	});
}

export async function deleteBook(bookId: string) {
	return client.delete('books', bookId);
}
