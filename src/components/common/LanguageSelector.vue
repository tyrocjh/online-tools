<template>
  <div class="language-selector">
    <button
      v-for="lang in languages"
      :key="lang.value"
      class="lang-btn"
      :class="{ active: currentLanguage === lang.value }"
      @click="selectLanguage(lang.value)"
    >
      {{ lang.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps({
  languages: {
    type: Array,
    required: true,
  },
  currentLanguage: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["select"]);

const selectLanguage = (lang: string) => {
  emit("select", lang);
};
</script>

<style scoped lang="scss">
.language-selector {
  display: flex;
  background-color: var(--bg-primary);
  border-radius: 9999px;
  padding: 4px;
  gap: 0;

  .lang-btn {
    padding: 6px 20px;
    border: none;
    border-radius: 9999px;
    background-color: transparent;
    color: var(--text-secondary);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: var(--text-primary);
    }

    &.active {
      background-color: white;
      color: var(--text-primary);
      font-weight: 500;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
  }
}
</style>
