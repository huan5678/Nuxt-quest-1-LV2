// server/api/home/news.ts
import { defineEventHandler } from "h3";
import { fetchApi } from "~/server/utils/api";

export default defineEventHandler(async (event) => {
	const response = await fetchApi(event, "/home/news/");
	return response;
});
