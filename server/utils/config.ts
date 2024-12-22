export const getApiConfig = () => {
	const config = useRuntimeConfig();
	return {
		baseUrl: `${config.apiBase}${config.apiPath}`,
		headers: {
			"Content-Type": "application/json",
		},
	};
};
