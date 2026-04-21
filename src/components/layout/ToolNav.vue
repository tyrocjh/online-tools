<template>
  <div class="tool-nav-container">
    <!-- 搜索功能 -->
    <div class="search-box">
      <div class="search-input-container">
        <Search class="search-icon" />
        <input
          type="text"
          v-model="searchKeyword"
          :placeholder="t('common.search')"
          class="search-input"
        />
      </div>
    </div>

    <!-- 工具列表导航 -->
    <nav class="tool-nav">
      <ul class="tool-list">
        <li class="tool-item" v-for="tool in filteredTools" :key="tool.path">
          <router-link :to="tool.path" class="tool-link" ref="linkRef">
            <span
              class="tool-icon"
              :class="{ active: isActive(tool.path) }"
              :style="{
                backgroundColor: isActive(tool.path)
                  ? 'var(--primary-color)'
                  : tool.color + '20',
              }"
            >
              <component
                :is="tool.icon"
                class="icon"
                :style="{
                  color: isActive(tool.path) ? 'var(--bg-primary)' : tool.color,
                }"
              />
            </span>
            {{ tool.name }}
          </router-link>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useTranslation } from "@/utils/i18n";
import {
  Code,
  FileJson,
  Clock,
  Key,
  Image,
  Search,
  Crop,
  Paintbrush,
  Grid,
  BarChart3,
  Globe,
  Calendar,
  Zap,
  GitBranch,
} from "lucide-vue-next";

// 使用翻译钩子
const { t } = useTranslation();

// 路由
const route = useRoute();

// 判断路径是否是活动状态
const isActive = (path: string): boolean => {
  return route.path === path;
};

// 搜索功能
const searchKeyword = ref("");
const tools = computed(() => [
  {
    name: t("nav.codeTools"),
    path: "/code-tools",
    icon: Code,
    color: "#2196F3",
  },
  {
    name: t("nav.jsonTools"),
    path: "/json-tools",
    icon: FileJson,
    color: "#FF9800",
  },
  {
    name: t("nav.timeTools"),
    path: "/time-tools",
    icon: Clock,
    color: "#9C27B0",
  },
  {
    name: t("nav.uuidTools"),
    path: "/uuid-tools",
    icon: Key,
    color: "#F44336",
  },
  {
    name: t("nav.imageTools"),
    path: "/image-tools",
    icon: Image,
    color: "#00BCD4",
  },
  // 预留颜色
  { name: "", path: "", icon: Code, color: "#FF5722" },
  {
    name: t("nav.imageCrop"),
    path: "/image-crop",
    icon: Crop,
    color: "#009688",
  },
  {
    name: t("nav.imageWatermark"),
    path: "/image-watermark",
    icon: Paintbrush,
    color: "#009688",
  },
  {
    name: t("nav.imageGrid"),
    path: "/image-grid",
    icon: Grid,
    color: "#009688",
  },
  { name: "", path: "", icon: Code, color: "#607D8B" },
  { name: "", path: "", icon: Code, color: "#795548" },
  {
    name: t("nav.qrCodeTools"),
    path: "/qrcode",
    icon: BarChart3,
    color: "#4CAF50",
  },
  {
    name: t("nav.ipTools"),
    path: "/ip-tools",
    icon: Globe,
    color: "#1E88E5",
  },
  {
    name: t("nav.calendarTools"),
    path: "/calendar",
    icon: Calendar,
    color: "#FF9800",
  },
  {
    name: t("nav.reactionTest"),
    path: "/reaction-test",
    icon: Zap,
    color: "#FF5722",
  },
  {
    name: t("nav.mindMap"),
    path: "/mind-map",
    icon: GitBranch,
    color: "#9C27B0",
  },
]);

const filteredTools = computed(() => {
  const allTools = tools.value.filter((tool) => tool.name); // 只显示有名称的工具
  if (!searchKeyword.value) {
    return allTools;
  }
  const keyword = searchKeyword.value.toLowerCase();
  return allTools.filter((tool) => tool.name.toLowerCase().includes(keyword));
});
</script>

<style scoped lang="scss">
.tool-nav-container {
  display: flex;
  flex-direction: column;
  height: 100%;

  .search-box {
    margin-bottom: 20px;

    .search-input-container {
      position: relative;
      width: 100%;

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        color: var(--text-secondary);
      }

      .search-input {
        width: 100%;
        padding: 8px 12px 8px 36px;
        border: 1px solid #e0e0e0;
        border-radius: 16px;
        font-size: 13px;
        background-color: var(--bg-primary);
        color: var(--text-primary);

        &:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
      }
    }
  }

  .tool-nav {
    flex: 1;
    overflow-y: auto;

    .tool-list {
      list-style: none;
      padding: 0;
      margin: 0;

      .tool-item {
        margin-bottom: 8px;

        .tool-link {
          display: flex;
          align-items: center;
          padding: 8px 12px;
          color: var(--text-primary);
          text-decoration: none;
          border-radius: 10px;
          transition: all 0.2s ease;
          font-size: 14px;

          &:hover {
            background-color: var(--bg-tertiary);
            color: var(--primary-color);
          }

          &.router-link-active {
            background-color: rgba(0, 123, 255, 0.1);
            color: var(--primary-color);
          }

          .tool-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            margin-right: 10px;
            border-radius: 4px;

            .icon {
              width: 16px;
              height: 16px;
            }

            .tool-link:hover & {
              opacity: 0.8;
            }

            .tool-link.router-link-active & {
              background-color: var(--primary-color);

              .icon {
                color: var(--bg-primary);
              }
            }
          }
        }
      }
    }
  }
}
</style>
