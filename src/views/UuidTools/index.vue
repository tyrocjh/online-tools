<template>
  <ToolPageLayout
    :title="t('uuidGenerator.title')"
    :description="t('uuidGenerator.description')"
  >
    <!-- 单个UUID生成 -->
    <div class="single-uuid-container">
      <div class="uuid-value">{{ singleUuid }}</div>
      <div class="uuid-actions">
        <ActionButton
          primary
          :text="t('uuidGenerator.generate')"
          :icon="RefreshCw"
          @click="generateSingleUuid"
        />
        <ActionButton
          :text="isCopied ? '已复制' : t('uuidGenerator.copy')"
          :icon="isCopied ? Check : Copy"
          @click="copySingleUuid"
        />
      </div>
    </div>

    <!-- 批量UUID生成 -->
    <div class="batch-uuid-container">
      <div class="batch-settings">
        <InputGroup :label="t('uuidGenerator.quantity')">
          <input
            type="number"
            v-model="batchQuantity"
            :placeholder="t('uuidGenerator.quantityPlaceholder')"
            class="input-field"
          />
        </InputGroup>
        <InputGroup :label="t('uuidGenerator.format')">
          <select v-model="selectedFormat" class="input-field">
            <option value="standard">
              {{ t("uuidGenerator.formats.standard") }}
            </option>
            <option value="uppercase">
              {{ t("uuidGenerator.formats.uppercase") }}
            </option>
            <option value="lowercase">
              {{ t("uuidGenerator.formats.lowercase") }}
            </option>
            <option value="noHyphens">
              {{ t("uuidGenerator.formats.noHyphens") }}
            </option>
            <option value="braces">
              {{ t("uuidGenerator.formats.braces") }}
            </option>
          </select>
        </InputGroup>
      </div>
      <ActionButton
        class="full-width-button"
        primary
        :text="t('uuidGenerator.batchGenerate')"
        :icon="List"
        @click="generateBatchUuid"
      />
      <div class="batch-results">
        <div class="results-header">
          <span>{{ t("uuidGenerator.batchResults") }}</span>
          <ActionButton
            :text="isAllCopied ? '已复制' : t('uuidGenerator.copyAll')"
            :icon="isAllCopied ? Check : Copy"
            @click="copyAllUuids"
          />
        </div>
        <div class="results-list">
          <div
            v-for="(uuid, index) in batchUuids"
            :key="index"
            class="result-item"
          >
            {{ uuid }}
          </div>
        </div>
      </div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTranslation } from "@/utils/i18n";
import { v4 as uuidv4 } from "uuid";
import { RefreshCw, Copy, Check, List } from "lucide-vue-next";

const { t } = useTranslation();

// 单个UUID
const singleUuid = ref("");
const isCopied = ref(false);

// 批量UUID
const batchQuantity = ref("10");
const selectedFormat = ref("standard");
const batchUuids = ref<string[]>([]);
const isAllCopied = ref(false);

// 生成单个UUID
const generateSingleUuid = () => {
  singleUuid.value = uuidv4();
};

// 复制单个UUID
const copySingleUuid = async () => {
  if (!singleUuid.value) return;

  try {
    await navigator.clipboard.writeText(singleUuid.value);
    isCopied.value = true;
    // 2秒后重置状态
    setTimeout(() => {
      isCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error("复制失败:", err);
  }
};

// 格式化UUID
const formatUuid = (uuid: string, format: string): string => {
  switch (format) {
    case "uppercase":
      return uuid.toUpperCase();
    case "lowercase":
      return uuid.toLowerCase();
    case "noHyphens":
      return uuid.replace(/-/g, "");
    case "braces":
      return `{${uuid}}`;
    default:
      return uuid;
  }
};

// 生成批量UUID
const generateBatchUuid = () => {
  const quantity = parseInt(batchQuantity.value) || 10;
  const uuids: string[] = [];

  for (let i = 0; i < quantity; i++) {
    const uuid = uuidv4();
    uuids.push(formatUuid(uuid, selectedFormat.value));
  }

  batchUuids.value = uuids;
};

// 复制所有UUID
const copyAllUuids = async () => {
  if (batchUuids.value.length === 0) return;

  try {
    const allUuids = batchUuids.value.join("\n");
    await navigator.clipboard.writeText(allUuids);
    isAllCopied.value = true;
    // 2秒后重置状态
    setTimeout(() => {
      isAllCopied.value = false;
    }, 2000);
  } catch (err) {
    console.error("复制失败:", err);
  }
};

// 组件挂载时生成一个UUID
onMounted(() => {
  generateSingleUuid();
});
</script>

<style scoped lang="scss">
.single-uuid-container {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  text-align: center;

  .uuid-value {
    font-family: "Consolas", "Monaco", "Courier New", monospace;
    font-size: 16px;
    color: var(--text-primary);
    background-color: var(--bg-primary);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 16px;
    word-break: break-all;
  }

  .uuid-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}

.batch-uuid-container {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;

  .batch-settings {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  :deep(.full-width-button) {
    width: 100%;
    justify-content: center;
    margin-bottom: 20px;
  }

  .batch-results {
    .results-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;

      span {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-secondary);
      }
    }

    .results-list {
      background-color: var(--bg-primary);
      border-radius: 8px;
      padding: 12px;
      max-height: 300px;
      overflow-y: auto;

      .result-item {
        font-family: "Consolas", "Monaco", "Courier New", monospace;
        font-size: 13px;
        color: var(--text-primary);
        padding: 8px 0;
        border-bottom: 1px solid var(--border-light-color);

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
}
</style>
