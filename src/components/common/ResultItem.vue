<template>
  <div class="result-item">
    <div class="result-label">{{ label }}</div>
    <div class="result-value">{{ value || "-" }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    default: "",
  },
});
</script>

<style scoped lang="scss">
.result-item {
  background-color: #f5f5f5;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .result-label {
    font-size: 12px;
    color: var(--text-secondary);
    margin-bottom: 4px;
    opacity: 0.8;
  }

  .result-value {
    font-size: 14px;
    color: var(--text-primary);
  }
}
</style>
