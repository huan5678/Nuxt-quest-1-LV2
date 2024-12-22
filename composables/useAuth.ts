// composables/useAuth.ts
import type {
  ApiResponse,
  CheckResponse,
  ApiErrorResponse,
  LoginProps,
  LoginResponse,
  RegisterProps,
  ProfileResponse,
  UserData,
  UserCookie
} from "@/types";

export const useAuth = () => {

  // 使用單一的 cookie 來存儲用戶數據
  const userData = useCookie<UserCookie | null>('userData', {
    maxAge: 60 * 60 * 24 * 7, // 7 天
    path: '/',
    secure: true,
    sameSite: 'strict'
  });

   // 使用 useState 確保跨頁面狀態同步
  const isLoggedIn = useState<boolean>('auth:logged-in', () => false);
  const authToken = useState<string | null>('auth:token', () => null);
  const authInitialized = useState<boolean>('auth:initialized', () => false);
  const user = useState<UserData | null>('auth:user', () => null);



  // 更新 token 的輔助函數
  const updateToken = (token: string | null) => {
    authToken.value = token;
  };

  // 初始化函數
  const initializeAuth = async () => {
    // 如果已經初始化過，直接返回
  if (authInitialized.value && isLoggedIn.value) {
    return true;
  }

  try {
    // 檢查 cookie 中是否有數據
    if (userData.value) {
      // 設置初始狀態
      authToken.value = userData.value.token;
      isLoggedIn.value = true;

      try {
        // 驗證 token 有效性
        const tokenCheck = await useApi().checkTokenExpired();
        const tokenResult = await tokenCheck.data.value as CheckResponse;

        if (!tokenResult.status) {
          clearAuthState();
          return false;
        }

        // 獲取最新的用戶資料
        const profileResponse = await useApi().getProfile();
        const profileResult = await profileResponse.data.value as ProfileResponse;

        if (profileResult.status && profileResult.result) {
          // 更新用戶資料
          user.value = profileResult.result;

          // 更新 cookie
          const userDataToStore = {
            token: userData.value.token,
            email: profileResult.result.email,
            name: profileResult.result.name,
            ID: profileResult.result.id
          };
          userData.value = userDataToStore;

          authInitialized.value = true;
          return true;
        }
      } catch (error) {
        console.error('Error during initialization:', error);
        clearAuthState();
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error('Initialization error:', error);
    clearAuthState();
    return false;
  }
  };

  // 清除認證狀態
  const clearAuthState = () => {
    isLoggedIn.value = false;
    user.value = null;
    userData.value = null;
    authToken.value = null;
    authInitialized.value = false;
  };

  // 登入
  const login = async (data: LoginProps) => {
    try {
      const response = await useApi().login(data);
      const loginResponse = await response.data.value as LoginResponse;

      if (!loginResponse || ('status' in loginResponse && !loginResponse.status)) {
        clearAuthState();
        return loginResponse;
      }

      if (loginResponse.result) {
        // 更新狀態
        isLoggedIn.value = true;
        user.value = loginResponse.result;
        updateToken(loginResponse.token);

        // 保存用戶數據到 cookie
        const userDataToStore = {
          token: loginResponse.token,
          email: loginResponse.result.email,
          name: loginResponse.result.name,
          ID: loginResponse.result.id
        };
        userData.value = userDataToStore;
        authInitialized.value = true;
      }

      return loginResponse;
    } catch (err) {
      console.error('Login error:', err);
      clearAuthState();
      throw err;
    }
  };

  // 註冊
  const register = async (registerData: RegisterProps) => {
    try {
      const response = await useApi().register(registerData);
      return await response.data.value as ApiResponse<LoginResponse> | ApiErrorResponse;
    } catch (err) {
      console.error("Registration failed:", err);
      throw err;
    }
  };

  // 驗證認證狀態
  const verifyAuth = async (): Promise<boolean> => {
    try {
      // 先嘗試從 cookie 初始化
      if (!authInitialized.value) {
        const initialized = initializeAuth();
        if (!initialized) {
          return false;
        }
      }

      const token = authToken.value;
      if (!token) {
        console.log('No token found');
        clearAuthState();
        return false;
      }

      // 驗證 token
      const tokenCheck = await useApi().checkTokenExpired();
      const tokenResult = await tokenCheck.data.value as CheckResponse;

      if (!tokenResult.status) {
        console.log('verifyAuth, Token expired or invalid');
        clearAuthState();
        return false;
      }

      // 獲取用戶資料
      const profileResponse = await useApi().getProfile();
      const profileResult = await profileResponse.data.value as ProfileResponse;

      if (!profileResult.status) {
        console.log('verifyAuth, Profile status false');
        clearAuthState();
        return false;
      }

      // 更新用戶資料
      if (profileResult.result) {
        user.value = profileResult.result;
        isLoggedIn.value = true;
        authInitialized.value = true;

        // 更新 cookie 中的用戶資料
        const userDataToStore = {
          token: token,
          email: profileResult.result.email,
          name: profileResult.result.name,
          ID: profileResult.result.id
        };
        userData.value = userDataToStore;

        return true;
      }
      clearAuthState();
      return false;
    } catch (error) {
      clearAuthState();
      return false;
    }
  };

  // 檢查認證狀態
  const checkAuth = async () => {
    // 如果已經初始化且已登入，只檢查 token
    if (authInitialized.value && isLoggedIn.value) {
      const token = authToken.value;
      if (!token) {
        clearAuthState();
        return false;
      }
      return true;
    }

    // 如果未初始化或未登入，進行完整驗證
    if (!authInitialized.value) {
      return await verifyAuth();
    }

    return isLoggedIn.value;
  };

  // 登出函數
  const logout = () => {
    clearAuthState();
    navigateTo('/');
  };

  // 在 plugins 中使用這個函數
  const initialize = async () => {
    if (!authInitialized.value) {
     await initializeAuth();
    }
  };


  return {
    isLoggedIn: computed(() => isLoggedIn.value),
    user: computed(() => user.value),
    token: computed(() => authToken.value),
    initialize,
    verifyAuth,
    checkAuth,
    login,
    logout,
    register
  };
};
