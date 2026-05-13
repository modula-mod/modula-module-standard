export type ExampleFunctionInput = {
	title: string;
	body?: string;
};

export async function exampleFunction(input: ExampleFunctionInput) {
	return {
		id: crypto.randomUUID(),
		title: input.title,
		body: input.body ?? '',
		created_at: Date.now()
	};
}
