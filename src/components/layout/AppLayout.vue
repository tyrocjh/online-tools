<template>
  <div class="app-layout">
    <!-- 侧边栏 -->
    <aside class="sidebar">
      <!-- 标题/LOGO -->
      <div class="sidebar-header">
        <router-link to="/" class="logo-link">
          <div class="logo-container">
            <PenToolIcon class="logo-icon" />
            <h1 class="logo">{{ t("common.appName") }}</h1>
          </div>
        </router-link>
      </div>

      <!-- 工具导航组件 -->
      <ToolNav />

      <!-- 侧边栏底部组件 -->
      <SidebarFooter />
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <slot></slot>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useTranslation } from "@/utils/i18n";
import ToolNav from "./ToolNav.vue";
import SidebarFooter from "./SidebarFooter.vue";
import { PenToolIcon } from "lucide-vue-next";

// 使用翻译钩子
const { t } = useTranslation();
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;

  .sidebar {
    width: 250px;
    background-color: var(--bg-secondary);
    border-right: 1px solid rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    padding: 20px 20px 0;

    .sidebar-header {
      margin-bottom: 20px;

      .logo-link {
        text-decoration: none;
        display: block;

        .logo-container {
          display: flex;
          align-items: center;
          gap: 10px;

          .logo-icon {
            color: var(--primary-color);
            transition: color 0.2s ease;

            &:hover {
              color: var(--primary-color);
            }
          }

          .logo {
            font-size: 22px;
            font-weight: bold;
            color: var(--text-primary);
            margin: 0;
            transition: color 0.2s ease;

            &:hover {
              color: var(--primary-color);
            }
          }
        }
      }
    }
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    padding: 30px;
    background-color: var(--bg-primary);
    color: var(--text-primary);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .app-layout {
    flex-direction: column;

    .sidebar {
      width: 100%;
      height: auto;
      border-right: none;
      border-bottom: 1px solid #e9ecef;
      padding: 10px;

      .sidebar-header {
        margin-bottom: 10px;

        .logo-container {
          gap: 8px;

          .logo-icon {
            width: 20px;
            height: 20px;
          }

          .logo {
            font-size: 20px;
          }
        }
      }

      .search-box {
        margin-bottom: 10px;
      }

      .tool-nav {
        .tool-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .tool-item {
            margin-bottom: 0;

            .tool-link {
              padding: 6px 12px;
              font-size: 14px;
            }
          }
        }
      }
    }

    .main-content {
      flex: 1;
      min-height: 0;
    }
  }
}
</style>
