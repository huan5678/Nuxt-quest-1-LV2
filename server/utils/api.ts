// server/utils/api.ts
import type { H3Event } from "h3";

export async function fetchApi(event: H3Event, path: string, options?: RequestInit) {
	const config = useRuntimeConfig(event);

	if (!config.public.apiBase || !config.public.apiPath) {
		throw createError({
			statusCode: 500,
			message: "API configuration is missing",
		});
	}

	try {
		const response = await fetch(
			`${config.public.apiBase}${config.public.apiPath}${path}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
          ...(options?.headers || {}),
				},
			},
		);

		if (!response.ok) {
			throw createError({
				statusCode: response.status,
				message: response.statusText,
			});
		}

		return response.json();
	} catch (error) {
		throw createError({
			statusCode: 500,
			message: (error as Error).message || "API request failed",
		});
	}
}
