<template>
  <div class="sidebar-footer">
    <!-- 夜间模式切换 -->
    <button class="control-btn" @click="toggleTheme" :title="t('common.theme')">
      <Sun v-if="isDark" class="control-icon" />
      <Moon v-else class="control-icon" />
    </button>

    <!-- 主题色切换 -->
    <div class="color-control">
      <button
        class="control-btn"
        @click="toggleColorSelector"
        :title="t('common.color')"
      >
        <Palette class="control-icon" />
      </button>

      <!-- 主题色选择器弹窗 -->
      <div class="color-selector-popup" v-if="showColorSelector">
        <div class="color-selector-content">
          <div class="theme-color-list">
            <button
              v-for="color in themeColors"
              :key="color.value"
              class="theme-color-item"
              :class="{ active: currentColor === color.value }"
              :style="{ backgroundColor: color.value }"
              :title="color.name"
              @click="changeThemeColor(color.value)"
            ></button>
          </div>
        </div>
      </div>
    </div>

    <!-- 国际化 -->
    <div class="language-control">
      <button
        class="control-btn"
        @click="toggleLanguageSelector"
        :title="t('common.language')"
      >
        <Globe class="control-icon" />
      </button>

      <!-- 语言选择器弹窗 -->
      <div class="language-selector-popup" v-if="showLanguageSelector">
        <div class="language-selector-content">
          <div class="language-list">
            <button
              v-for="lang in languages"
              :key="lang.value"
              class="language-item"
              :class="{ active: currentLanguage === lang.value }"
              @click="changeLanguage(lang.value)"
            >
              {{ lang.name }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Sun, Moon, Palette, Globe } from "lucide-vue-next";
import { useThemeStore } from "@/stores/theme";
import { useThemeColorStore, themeColors } from "@/stores/themeColor";
import { useI18nStore, languages } from "@/stores/i18n";
import { useTranslation } from "@/utils/i18n";

// 使用翻译钩子
const { t } = useTranslation();

const themeStore = useThemeStore();
const themeColorStore = useThemeColorStore();
const i18nStore = useI18nStore();
const isDark = computed(() => themeStore.isDark);
const currentColor = computed(() => themeColorStore.currentColor);
const currentLanguage = computed(() => i18nStore.currentLanguage);
const showColorSelector = ref(false);
const showLanguageSelector = ref(false);

const toggleTheme = () => {
  themeStore.toggleTheme();
};

const changeThemeColor = (color: string) => {
  themeColorStore.setThemeColor(color);
  showColorSelector.value = false;
};

const toggleColorSelector = () => {
  showColorSelector.value = !showColorSelector.value;
  showLanguageSelector.value = false;
};

const changeLanguage = (lang: string) => {
  i18nStore.setLanguage(lang);
  showLanguageSelector.value = false;
};

const toggleLanguageSelector = () => {
  showLanguageSelector.value = !showLanguageSelector.value;
  showColorSelector.value = false;
};

// 点击外部关闭选择器
const handleClickOutside = (event: MouseEvent) => {
  const colorControl = document.querySelector(".color-control");
  const languageControl = document.querySelector(".language-control");

  if (colorControl && !colorControl.contains(event.target as Node)) {
    showColorSelector.value = false;
  }

  if (languageControl && !languageControl.contains(event.target as Node)) {
    showLanguageSelector.value = false;
  }
};

// 挂载时添加点击事件监听
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped lang="scss">
.sidebar-footer {
  margin-top: auto;
  padding: 15px 20px 15px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: calc(100% + 40px);
  box-sizing: border-box;
  margin-left: -20px;
  margin-right: -20px;

  .control-btn {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-color);
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    transition: all 0.2s ease;
    color: var(--text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: var(--text-primary);
    }

    .control-icon {
      width: 18px;
      height: 18px;
      color: currentColor;
    }
  }

  .color-control {
    position: relative;

    .color-selector-popup {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 10px;
      z-index: 1000;

      .color-selector-content {
        background-color: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 12px;
        box-shadow: var(--shadow-lg);

        .theme-color-list {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;

          .theme-color-item {
            width: 20px;
            height: 20px;
            border: 2px solid transparent;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s ease;

            &:hover {
              transform: scale(1.1);
            }

            &.active {
              border-color: var(--text-primary);
              box-shadow: 0 0 0 2px var(--bg-primary);
            }
          }
        }
      }
    }
  }

  .language-control {
    position: relative;

    .language-selector-popup {
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: 10px;
      z-index: 1000;

      .language-selector-content {
        background-color: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 8px;
        box-shadow: var(--shadow-lg);

        .language-list {
          display: flex;
          gap: 6px;

          .language-item {
            padding: 4px 10px;
            border: 1px solid var(--border-color);
            border-radius: 20px;
            background-color: var(--bg-secondary);
            color: var(--text-primary);
            cursor: pointer;
            transition: all 0.2s ease;
            text-align: left;
            font-size: 12px;
            white-space: nowrap;

            &:hover {
              background-color: var(--bg-tertiary);
              border-color: var(--primary-color);
            }

            &.active {
              background-color: var(--primary-color);
              color: var(--bg-primary);
              border-color: var(--primary-color);
            }
          }
        }
      }
    }
  }
}
</style>
