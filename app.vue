<script setup>
const layout = useState('layout');
const auth = useAuth();

// 在應用啟動時初始化
onMounted(() => {
  if (import.meta.client) {
    auth.initialize();
  }
});
</script>

<template>
  <NuxtLayout :name="layout">
    <NuxtPage />
  </NuxtLayout>
</template>
