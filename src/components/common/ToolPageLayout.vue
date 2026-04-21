<template>
  <div class="tool-page-layout">
    <!-- 页面头部 -->
    <div class="page-header">
      <h1 class="page-title">{{ title }}</h1>
      <p class="page-description">{{ description }}</p>
    </div>

    <!-- 工具栏 -->
    <div v-if="toolbar" class="toolbar-box">
      <slot name="toolbar"></slot>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-area">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  toolbar: {
    type: Boolean,
    default: true,
  },
});
</script>

<style scoped lang="scss">
.tool-page-layout {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;

  .page-header {
    margin-bottom: 30px;

    .page-title {
      font-size: 26px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 10px 0;
    }

    .page-description {
      font-size: 14px;
      color: var(--text-secondary);
      margin: 0;
    }
  }

  .toolbar-box {
    margin-bottom: 20px;
  }

  .content-area {
    // 内容区域样式
  }
}

@media (max-width: 768px) {
  .tool-page-layout {
    padding: 20px 15px;
  }
}
</style>
