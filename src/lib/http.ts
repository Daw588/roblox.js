type Info = {
	url: string,
	method: "GET" | "POST" | "PATCH" | "DELETE"
	query: {
		[index: string]: string | number | boolean | null | undefined
	},
	headers: {
		[index: string]: string
	},
	body?: string
}

export async function request(info: Info) {
	const query = new URLSearchParams();
	for (const [key, value] of Object.entries(info.query)) {
		if (value) {
			if (typeof(value) === "string") {
				query.append(key, value);
			} else if (typeof(value) === "number" || typeof(value) === "boolean") {
				query.append(key, value.toString());
			}
		}
	}

	const response = await fetch(info.url + "?" + query.toString(), {
		method: info.method,
		headers: info.headers,
		body: info.body
	});

	return response;
}
