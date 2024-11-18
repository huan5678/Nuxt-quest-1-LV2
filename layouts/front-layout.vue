<script setup>
import AppHeader from '@/components/global/AppHeader.vue';
import AppFooter from '@/components/global/AppFooter.vue';
</script>

<template>
  <div>
    <AppHeader />
    <slot />
    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>

</style>
