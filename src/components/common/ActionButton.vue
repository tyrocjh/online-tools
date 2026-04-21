<template>
  <button class="action-button" :class="{ primary }" @click="$emit('click')" :disabled="disabled">
    <component v-if="icon" :is="icon" class="button-icon" />
    <span v-if="text" class="button-text">{{ text }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: "",
  },
  icon: {
    type: [Object, Function],
    default: null,
  },
  primary: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["click"]);
</script>

<style scoped lang="scss">
.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--border-color);
  border-radius: 9999px; /* 圆角按钮 */
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &.primary {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;

    &:hover {
      opacity: 0.9;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
    
    &:hover {
      border-color: var(--border-color);
      color: var(--text-primary);
    }
    
    &.primary {
      &:hover {
        opacity: 0.6;
        box-shadow: none;
      }
    }
  }

  .button-icon {
    width: 14px;
    height: 14px;
  }
}
</style>
