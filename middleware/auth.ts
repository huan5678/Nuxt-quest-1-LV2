// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuth();

  // 確保在進入路由前已經初始化
  if (import.meta.client && !auth.isLoggedIn.value) {
    auth.initialize();
  }

  // 需要認證的路徑
  const protectedRoutes = ['/user', '/orders'];
  if (protectedRoutes.some(route => to.path.startsWith(route))) {
    const isAuthenticated = await auth.checkAuth();
    if (!isAuthenticated) {
      return navigateTo('/account/login');
    }
  }

  // 已登入用戶訪問登入頁面
  if (auth.isLoggedIn.value && to.path === '/account/login') {
    return navigateTo('/');
  }
});
