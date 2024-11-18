import type { UseFetchOptions } from "nuxt/app";

const BASE_URL = "https://nuxr3.zeabur.app";

const API_PATH = "/api/v1";

export const useApi = () => {
	const token = useCookie("token");

	const fetchWrapper = async <T>(
		endpoint: string,
		options: UseFetchOptions<T> = {},
	) => {
		const headers = {
			...(token.value ? { Authorization: `Bearer ${token.value}` } : {}),
			...(options.headers || {}),
		};

		return useFetch(endpoint, {
			baseURL: BASE_URL + API_PATH,
			...options,
			headers,
		});
	};

	return {
		// Auth相關
		login: (data: { account: string; password: string }) =>
			fetchWrapper("/user/login", {
				method: "POST",
				body: data,
			}),

		register: (data: { account: string; password: string; name: string }) =>
			fetchWrapper("/user/signup", {
				method: "POST",
				body: data,
			}),

		forgotPassword: (data: {
			email: string;
			code: string;
			newPassword: string;
		}) =>
			fetchWrapper("/user/forgot", {
				method: "POST",
				body: data,
			}),

		checkTokenExpired: () =>
			fetchWrapper("/user/check", {
				method: "GET",
			}),

		// User相關
		getProfile: () =>
			fetchWrapper("/user/", {
				method: "GET",
			}),

		updateProfile: (data: { name: string }) =>
			fetchWrapper("/user/profile", {
				method: "PUT",
				body: data,
			}),

		// Verify
		verifyEmail: (data: { email: string }) =>
			fetchWrapper("/verify/email", {
				method: "POST",
				body: data,
			}),

		generateEmailCode: (data: { email: string }) =>
			fetchWrapper("/verify/generateEmailCode", {
				method: "POST",
				body: data,
			}),

		// Home/News - 最新消息
		getNewsList: () =>
			fetchWrapper("/home/news/", {
				method: "GET",
			}),

		// Home/Culinary - 美味佳餚
		getCulinaryList: () =>
			fetchWrapper("/home/culinary/", {
				method: "GET",
			}),

		// Rooms - 房型
		getRoomList: () =>
			fetchWrapper("/rooms/", {
				method: "GET",
			}),
		getRoomDetail: (id: string) =>
			fetchWrapper(`/rooms/${id}`, {
				method: "GET",
			}),

		// Orders - 訂單
		getOrderList: () =>
			fetchWrapper("/orders/", {
				method: "GET",
			}),
		createOrder: (data: {
			roomId: string;
			checkInDate: string;
			checkOutDate: string;
			peopleNum: number;
			userInfo: {
				address: { zipCode: number; detail: string };
				name: string;
				phone: string;
				email: string;
			};
		}) =>
			fetchWrapper("/orders/", {
				method: "POST",
				body: data,
			}),
		getOrderDetail: (id: string) =>
			fetchWrapper(`/orders/${id}`, {
				method: "GET",
			}),
		deleteOrder: (id: string) =>
			fetchWrapper(`/orders/${id}`, {
				method: "DELETE",
			}),
	};
};
