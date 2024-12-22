// server/api/rooms/index.ts
import { defineEventHandler } from "h3";
import { fetchApi } from "~/server/utils/api";

export default defineEventHandler(async (event) => {
	const response = await fetchApi(event, "/rooms/");
	return response;
});
