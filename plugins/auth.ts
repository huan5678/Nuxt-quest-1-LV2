// plugins/auth.ts
export default defineNuxtPlugin(async () => {
  const auth = useAuth();
  const router = useRouter();

  if (import.meta.client) {
    // 立即執行初始化
    await auth.initialize();

    router.beforeEach(async (_to, _from) => {
      if (!auth.isLoggedIn.value) {
        await auth.initialize();
      }
      return true;
    });
  }
});
