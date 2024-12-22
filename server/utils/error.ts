interface ApiErrorResponse {
	response?: {
		status?: number;
		data?: {
			message?: string;
		};
	};
}

export const handleApiError = (error: ApiErrorResponse): never => {
	const statusCode = error.response?.status || 500;
	const message = error.response?.data?.message || "Internal Server Error";

	throw createError({
		statusCode,
		statusMessage: message,
	});
};
