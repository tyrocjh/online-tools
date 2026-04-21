<template>
  <template v-if="!isLegalPage">
    <AppLayout>
      <router-view />
    </AppLayout>
  </template>
  <template v-else>
    <router-view />
  </template>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AppLayout from "./components/layout/AppLayout.vue";

const route = useRoute();
const isLegalPage = computed(() => {
  return ["/about", "/privacy", "/terms"].includes(route.path);
});
</script>

<style scoped lang="scss">
/* 组件样式 */
</style>
