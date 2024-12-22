export default defineNuxtRouteMiddleware((to) => {
  const { isLoggedIn } = useAuth();
  const layout = useState('layout');

  // 根據路由和認證狀態設置布局
  if (isLoggedIn.value && to.path.startsWith('/user')) {
    layout.value = 'user-layout';
  } else if (['/account/login', '/account/signup'].includes(to.path)) {
    layout.value = 'account-layout';
  } else {
    layout.value = 'front-layout';
  }
});
