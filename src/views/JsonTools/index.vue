<template>
  <ToolPageLayout
    :title="t('jsonCompare.title')"
    :description="t('jsonCompare.description')"
    :toolbar="true"
  >
    <!-- 工具栏 -->
    <template #toolbar>
      <div class="toolbar">
        <div class="toolbar-left">
          <!-- 操作按钮 -->
          <div class="action-btns">
            <ActionButton
              primary
              :text="t('jsonCompare.compare')"
              :icon="GitCompare"
              @click="compareJson"
            />
            <ActionButton
              :text="t('jsonCompare.example')"
              :icon="FileCode"
              @click="loadExample"
            />
            <ActionButton
              :text="t('jsonCompare.clear')"
              :icon="Trash2"
              @click="clearAll"
            />
          </div>
        </div>
      </div>
    </template>

    <!-- 输入区域 -->
    <div class="input-container">
      <!-- 原JSON输入框 -->
      <Panel :title="t('jsonCompare.originalJson')">
        <textarea
          v-model="originalJson"
          class="code-textarea"
          :placeholder="t('jsonCompare.inputPlaceholder')"
          spellcheck="false"
        ></textarea>
      </Panel>

      <!-- 修改后JSON输入框 -->
      <Panel :title="t('jsonCompare.modifiedJson')">
        <textarea
          v-model="modifiedJson"
          class="code-textarea"
          :placeholder="t('jsonCompare.inputPlaceholder')"
          spellcheck="false"
        ></textarea>
      </Panel>
    </div>

    <!-- 对比结果统计 -->
    <div class="diff-stats" v-if="diffResult">
      <span class="stat added" v-if="diffResult.added > 0"
        >+{{ diffResult.added }} {{ t("jsonCompare.added") }}</span
      >
      <span class="stat removed" v-if="diffResult.removed > 0"
        >-{{ diffResult.removed }} {{ t("jsonCompare.removed") }}</span
      >
      <span class="stat changed" v-if="diffResult.changed > 0"
        >~{{ diffResult.changed }} {{ t("jsonCompare.changed") }}</span
      >
    </div>

    <!-- 对比展示框 -->
    <div class="diff-container" v-if="diffResult">
      <!-- 差异内容 -->
      <div class="diff-content" v-html="diffResult.html"></div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useTranslation } from "@/utils/i18n";
import { GitCompare, FileCode, Trash2 } from "lucide-vue-next";
import * as jsondiffpatch from "jsondiffpatch";

const { t } = useTranslation();

// 输入的JSON
const originalJson = ref("");
const modifiedJson = ref("");

// 对比结果
const diffResult = ref(null);

// 加载示例数据
const loadExample = () => {
  originalJson.value = `{
  "name": "FireTool",
  "version": "1.0",
  "features": [
    "json",
    "base64",
    "hash"
  ],
  "config": {
    "theme": "dark"
  }
}`;

  modifiedJson.value = `{
  "name": "FireTool",
  "version": "2.0",
  "features": [
    "json",
    "base64",
    "hash",
    "diff"
  ],
  "config": {
    "theme": "auto",
    "lang": "en",
    "debug": true
  }
}`;
};

// 清空所有
const clearAll = () => {
  originalJson.value = "";
  modifiedJson.value = "";
  diffResult.value = null;
};

// 对比JSON
const compareJson = () => {
  if (!originalJson.value.trim() || !modifiedJson.value.trim()) {
    return;
  }

  try {
    const original = JSON.parse(originalJson.value);
    const modified = JSON.parse(modifiedJson.value);

    // 使用jsondiffpatch计算差异
    const diff = jsondiffpatch.diff(original, modified);

    // 计算变更统计
    const stats = calculateStats(diff);

    // 生成差异HTML
    const html = generateDiffHtml(original, modified, diff);

    diffResult.value = {
      added: stats.added,
      removed: stats.removed,
      changed: stats.changed,
      html,
    };
  } catch (error) {
    console.error("JSON解析错误:", error);
  }
};

// 计算变更统计
const calculateStats = (diff) => {
  const stats = {
    added: 0,
    removed: 0,
    changed: 0,
  };

  const countChanges = (obj, path = "") => {
    if (typeof obj === "object" && obj !== null) {
      for (const key in obj) {
        if (key === "_t") continue; // 跳过类型标记

        if (Array.isArray(obj[key])) {
          // 处理数组差异
          if (obj[key].length === 3 && obj[key][0] === 0) {
            // 数组添加
            stats.added++;
          } else if (obj[key].length === 3 && obj[key][0] === 1) {
            // 数组删除
            stats.removed++;
          } else {
            // 递归处理数组元素
            countChanges(obj[key], `${path}[${key}]`);
          }
        } else if (typeof obj[key] === "object") {
          // 递归处理对象
          countChanges(obj[key], path ? `${path}.${key}` : key);
        } else {
          // 简单值变更
          if (obj[key] === undefined) {
            // 删除
            stats.removed++;
          } else {
            // 修改或添加
            stats.changed++;
          }
        }
      }
    }
  };

  if (diff) {
    countChanges(diff);
  }

  return stats;
};

// 生成差异HTML
const generateDiffHtml = (original, modified, diff) => {
  // 直接使用自定义实现，避免jsondiffpatch formatters的问题
  return generateCustomDiffHtml(original, modified, diff);
};

// 自定义差异HTML生成函数
const generateCustomDiffHtml = (original, modified, diff) => {
  let html = '<pre class="diff-pre">';
  let indent = 0;

  // 递归生成HTML
  const generateHtml = (obj, path = "") => {
    if (typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj)) {
        html += "[";
        html += "\n";
        indent++;
        obj.forEach((item, index) => {
          html += "  ".repeat(indent);
          html += '<span class="array-index">[' + index + "]</span>";
          generateHtml(item, path ? `${path}[${index}]` : `[${index}]`);
          if (index < obj.length - 1) html += ",";
          html += "\n";
        });
        indent--;
        html += "  ".repeat(indent);
        html += "]";
      } else {
        html += "{";
        html += "\n";
        indent++;
        const keys = Object.keys(obj);
        keys.forEach((key, index) => {
          html += "  ".repeat(indent);
          html += '<span class="key">"' + key + '":</span> ';
          generateHtml(obj[key], path ? `${path}.${key}` : key);
          if (index < keys.length - 1) html += ",";
          html += "\n";
        });
        indent--;
        html += "  ".repeat(indent);
        html += "}";
      }
    } else if (typeof obj === "string") {
      html += '<span class="string">"' + obj + '"</span>';
    } else if (typeof obj === "number") {
      html += '<span class="number">' + obj + "</span>";
    } else if (typeof obj === "boolean") {
      html += '<span class="boolean">' + obj + "</span>";
    } else if (obj === null) {
      html += '<span class="null">null</span>';
    }
  };

  // 显示修改后的JSON结构，并高亮差异
  const generateDiff = (obj, diff, path = "") => {
    if (typeof obj === "object" && obj !== null) {
      if (Array.isArray(obj)) {
        html += "[";
        html += "\n";
        indent++;
        obj.forEach((item, index) => {
          const arrayPath = path ? `${path}[${index}]` : `[${index}]`;

          html += "  ".repeat(indent);
          // 检查是否是新添加的元素
          if (!original || !original[index]) {
            // 添加的元素
            html += '<span class="array-index added">[' + index + "]</span>";
            html += '<span class="added">';
            generateHtml(item, arrayPath);
            html += "</span>";
          } else if (!modified || !modified[index]) {
            // 删除的元素
            html += '<span class="array-index removed">[' + index + "]</span>";
            html += '<span class="removed">';
            generateHtml(item, arrayPath);
            html += "</span>";
          } else if (JSON.stringify(original[index]) !== JSON.stringify(item)) {
            // 修改的元素
            html += '<span class="array-index changed">[' + index + "]</span>";
            html += '<span class="changed">';
            html +=
              '<span class="old-value">' +
              JSON.stringify(original[index]) +
              "</span> ";
            html += '<span class="arrow">→</span> ';
            generateHtml(item, arrayPath);
            html += "</span>";
          } else {
            // 未变更的元素
            html += '<span class="array-index">[' + index + "]</span>";
            generateHtml(item, arrayPath);
          }

          if (index < obj.length - 1) html += ",";
          html += "\n";
        });
        indent--;
        html += "  ".repeat(indent);
        html += "]";
      } else {
        html += "{";
        html += "\n";
        indent++;
        const keys = Object.keys(obj);
        keys.forEach((key, index) => {
          const newPath = path ? `${path}.${key}` : key;

          html += "  ".repeat(indent);
          if (!original || !original[key]) {
            // 添加的键
            html += '<span class="key added">"' + key + '":</span> ';
            html += '<span class="added">';
            generateHtml(obj[key], newPath);
            html += "</span>";
          } else if (!modified || !modified[key]) {
            // 删除的键
            html += '<span class="key removed">"' + key + '":</span> ';
            html += '<span class="removed">';
            generateHtml(obj[key], newPath);
            html += "</span>";
          } else if (
            JSON.stringify(original[key]) !== JSON.stringify(obj[key])
          ) {
            // 修改的值
            html += '<span class="key changed">"' + key + '":</span> ';
            html += '<span class="changed">';
            // 显示原始值和修改后的值
            html +=
              '<span class="old-value">' +
              JSON.stringify(original[key]) +
              "</span> ";
            html += '<span class="arrow">→</span> ';
            generateHtml(obj[key], newPath);
            html += "</span>";
          } else {
            // 未变更的键
            html += '<span class="key">"' + key + '":</span> ';
            generateHtml(obj[key], newPath);
          }

          if (index < keys.length - 1) html += ",";
          html += "\n";
        });

        // 检查是否有删除的键
        if (original) {
          for (const key in original) {
            if (!obj.hasOwnProperty(key)) {
              html += "  ".repeat(indent);
              html += ",";
              html += "\n";
              html += "  ".repeat(indent);
              html += '<span class="key removed">"' + key + '":</span> ';
              html += '<span class="removed">';
              generateHtml(original[key], path ? `${path}.${key}` : key);
              html += "</span>";
              html += "\n";
            }
          }
        }

        indent--;
        html += "  ".repeat(indent);
        html += "}";
      }
    } else if (typeof obj === "string") {
      html += '<span class="string">"' + obj + '"</span>';
    } else if (typeof obj === "number") {
      html += '<span class="number">' + obj + "</span>";
    } else if (typeof obj === "boolean") {
      html += '<span class="boolean">' + obj + "</span>";
    } else if (obj === null) {
      html += '<span class="null">null</span>';
    }
  };

  // 显示修改后的JSON结构，高亮差异
  generateDiff(modified, diff);

  html += "</pre>";
  return html;
};
</script>

<style scoped lang="scss">
.input-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.diff-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;

  .stat {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 13px;
    font-weight: 500;

    &.added {
      background-color: rgba(0, 255, 0, 0.1);
      color: green;
    }

    &.removed {
      background-color: rgba(255, 0, 0, 0.1);
      color: red;
    }

    &.changed {
      background-color: rgba(255, 255, 0, 0.1);
      color: orange;
    }
  }
}

.diff-container {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 16px;
  max-height: 400px;
  overflow-y: auto;

  .diff-content {
    font-family: "Consolas", "Monaco", "Courier New", monospace;
    font-size: 13px;
    line-height: 1.6;

    /* jsondiffpatch默认样式 */
    .jsondiffpatch-delta {
      margin: 0;
    }

    .jsondiffpatch-added {
      background-color: rgba(0, 255, 0, 0.1);
      color: green;
    }

    .jsondiffpatch-deleted {
      background-color: rgba(255, 0, 0, 0.1);
      color: red;
      text-decoration: line-through;
    }

    .jsondiffpatch-modified .jsondiffpatch-left {
      background-color: rgba(255, 255, 0, 0.1);
      color: orange;
      text-decoration: line-through;
    }

    .jsondiffpatch-modified .jsondiffpatch-right {
      background-color: rgba(255, 255, 0, 0.1);
      color: orange;
    }

    .jsondiffpatch-unchanged {
      color: var(--text-primary);
    }

    .jsondiffpatch-value {
      font-family: "Consolas", "Monaco", "Courier New", monospace;
    }

    /* 自定义实现样式 */
    ::v-deep(.diff-pre) {
      margin: 0;
      white-space: pre-wrap;
    }

    ::v-deep(.key) {
      color: #9cdcfe;
    }

    ::v-deep(.string) {
      color: #ce9178;
    }

    ::v-deep(.number) {
      color: #b5cea8;
    }

    ::v-deep(.boolean) {
      color: #569cd6;
    }

    ::v-deep(.null) {
      color: #569cd6;
    }

    ::v-deep(.array-index) {
      color: #d4d4d4;
    }

    ::v-deep(.added) {
      background-color: rgba(0, 255, 0, 0.1);
      color: green;
    }

    ::v-deep(.removed) {
      background-color: rgba(255, 0, 0, 0.1);
      color: red;
      text-decoration: line-through;
    }

    ::v-deep(.changed) {
      background-color: rgba(255, 255, 0, 0.1);
      color: orange;
    }

    ::v-deep(.key.added) {
      color: green;
    }

    ::v-deep(.key.removed) {
      color: red;
    }

    ::v-deep(.key.changed) {
      color: orange;
    }

    ::v-deep(.array-index.added) {
      color: green;
    }

    ::v-deep(.array-index.removed) {
      color: red;
    }

    ::v-deep(.array-index.changed) {
      color: orange;
    }

    ::v-deep(.old-value) {
      text-decoration: line-through;
      color: red;
      margin-right: 8px;
    }

    ::v-deep(.arrow) {
      color: var(--text-secondary);
      margin: 0 8px;
    }
  }
}

@media (max-width: 768px) {
  .input-container {
    grid-template-columns: 1fr;
  }
}
</style>
