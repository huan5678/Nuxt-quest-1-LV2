import type { UseFetchOptions } from "nuxt/app";
import type {
  CreateOrderProps,
  ForgotPasswordProps,
  LoginProps,
  RegisterProps,
  UpdateProfileProps,
} from "@/types";

export const useApi = () => {
  const runtimeConfig = useRuntimeConfig();
  const { apiBase, apiPath } = runtimeConfig.public;
  const auth = useAuth();

  // 定義不需要 token 的端點列表
  const publicEndpoints = [
    '/user/login',
    '/user/signup',
    '/user/forgot',
    '/verify/email',
    '/verify/generateEmailCode'
  ];

  const fetchWrapper = async <T>(
    endpoint: string,
    options: UseFetchOptions<T> = {},
  ) => {
    // 基礎 headers
    const headers = {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    } as Record<string, string>;

    // 如果不是公開端點，才添加 token
    if (!publicEndpoints.includes(endpoint)) {
      try {
        // 使用 computed 值來獲取最新的 token
        const currentToken = auth.token.value;

        if (!currentToken && !publicEndpoints.includes(endpoint)) {
          throw new Error('No authentication token found');
        }

        if (currentToken) {
          headers.Authorization = `Bearer ${currentToken}`;
        }
      } catch (e) {
        if (!publicEndpoints.includes(endpoint)) {
          console.error('Authentication error:', e);
          throw new Error('Authentication error');
        }
      }
    }

    return useFetch(endpoint, {
      baseURL: apiBase + apiPath,
      ...options,
      headers,
      onResponseError: (error) => {
        console.error('API Response Error:', error);
        throw new Error(error?.response?._data?.message || '請求失敗');
      }
    });
  };

  return {
    // Auth相關 - 不需要認證的操作
    login: (data: LoginProps) =>
      fetchWrapper("/user/login", {
        method: "POST",
        body: data,
      }),

    register: (data: RegisterProps) =>
      fetchWrapper("/user/signup", {
        method: "POST",
        body: data,
      }),

    forgotPassword: (data: ForgotPasswordProps) =>
      fetchWrapper("/user/forgot", {
        method: "POST",
        body: data,
      }),

    // Verify相關 - 不需要認證的操作
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

    // 需要認證的操作
    checkTokenExpired: () =>
      fetchWrapper("/user/check", {
        method: "GET",
      }),

    getProfile: () =>
      fetchWrapper("/user/", {
        method: "GET",
      }),

    updateProfile: (data: UpdateProfileProps) =>
      fetchWrapper("/user/profile", {
        method: "PUT",
        body: data,
      }),

    // Orders相關 - 需要認證的操作
    getOrderList: () =>
      fetchWrapper("/orders/", {
        method: "GET",
      }),

    createOrder: (data: CreateOrderProps) =>
      fetchWrapper("/orders/", {
        method: "POST",
        body: data,
      }),

    getOrderDetail: (id: string) =>
      fetchWrapper(`/orders/${id}`, {
        method: "GET",
        retry: 1,
        timeout: 10000,
      }),

    deleteOrder: (id: string) =>
      fetchWrapper(`/orders/${id}`, {
        method: "DELETE",
      }),

    // 使用 server API 的方法 - 不需要認證
    getNewsList: () => useFetch("/api/home/news"),
    getCulinaryList: () => useFetch("/api/home/culinary"),
    getRoomList: () => useFetch("/api/rooms"),
    getRoomDetail: (id: string) =>
      useFetch(`/api/rooms/${id}`, {
        key: `room-${id}`,
      }),
  };
};
