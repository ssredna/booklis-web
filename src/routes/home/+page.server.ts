export const actions = {
	createGoal: async ({ request }) => {
		const data = await request.formData();
		console.log(data);
	}
};
