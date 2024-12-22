// server/api/rooms/[...].ts
import { defineEventHandler, getRouterParams } from "h3";

import { fetchApi } from "~/server/utils/api";

export default defineEventHandler(async (event) => {
	const params = getRouterParams(event);

	// 獲取完整的請求路徑
	const path = event.path;
	// 從路徑中提取 ID
	const matches = path.match(/^\/api\/rooms\/?(.*)$/);
	const roomId = matches?.[1];
	const response = await fetchApi(event, `/rooms/${roomId}`);
	return response;
});
