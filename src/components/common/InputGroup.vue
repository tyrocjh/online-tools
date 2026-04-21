<template>
  <div class="input-group" :class="{ 'input-group--inline': inline }">
    <label v-if="label">{{ label }}</label>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
defineProps({
  label: {
    type: String,
    default: "",
  },
  inline: {
    type: Boolean,
    default: false,
  },
});
</script>

<style scoped lang="scss">
.input-group {
  margin-bottom: 14px;

  label {
    display: block;
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .input-field {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--border-light-color);
    border-radius: 8px;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-size: 13px;

    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }

  &--inline {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 0;

    label {
      display: inline-block;
      margin-bottom: 0;
      white-space: nowrap;
    }
  }
}
</style>
