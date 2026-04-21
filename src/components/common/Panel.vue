<template>
  <div class="panel">
    <div class="panel-header" v-if="title">
      <span class="panel-title">{{ title }}</span>
    </div>
    <div class="panel-content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: '',
  },
});
</script>

<style scoped lang="scss">
.panel {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  overflow: hidden;

  .panel-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-light-color);

    .panel-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-secondary);
    }
  }

  .panel-content {
    padding: 20px;
  }
}
</style>