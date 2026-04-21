<template>
  <ToolPageLayout
    :title="t('timeTools.title')"
    :description="t('timeTools.description')"
    :toolbar="true"
  >
    <!-- 当前时间戳展示 -->
    <div class="current-timestamp">
      <div class="current-time-header">
        {{ t("timeTools.currentTimestamp") }}
      </div>
      <div class="current-time-value">{{ currentTimestamp }}</div>
      <div class="current-date-time">{{ currentDateTime }}</div>
      <div class="copy-buttons">
        <ActionButton
          :text="isSecondCopied ? '已复制' : t('timeTools.second')"
          :icon="isSecondCopied ? Check : Copy"
          @click="copyTimestamp('second')"
        />
        <ActionButton
          :text="isMillisecondCopied ? '已复制' : t('timeTools.millisecond')"
          :icon="isMillisecondCopied ? Check : Copy"
          @click="copyTimestamp('millisecond')"
        />
      </div>
    </div>

    <!-- 转换功能区域 -->
    <div class="conversion-container">
      <!-- 时间戳转日期 -->
      <Panel :title="t('timeTools.timestampToDate')">
        <InputGroup :label="t('timeTools.timestamp')">
          <input
            type="text"
            v-model="timestampInput"
            :placeholder="t('timeTools.timestampPlaceholder')"
            class="input-field"
          />
        </InputGroup>
        <ActionButton
          class="full-width-button"
          primary
          :text="t('timeTools.convert')"
          :icon="RefreshCw"
          @click="convertTimestampToDate"
        />
        <div class="result-group">
          <ResultItem
            :label="t('timeTools.localTime')"
            :value="localTimeResult"
          />
          <ResultItem label="UTC" :value="utcTimeResult" />
          <ResultItem label="ISO 8601" :value="isoTimeResult" />
          <ResultItem
            :label="t('timeTools.weekday')"
            :value="weekdayResult"
            class="mb0"
          />
        </div>
      </Panel>

      <!-- 日期转时间戳 -->
      <Panel :title="t('timeTools.dateToTimestamp')">
        <InputGroup :label="t('timeTools.dateTime')">
          <input
            type="datetime-local"
            v-model="dateInput"
            class="input-field"
          />
        </InputGroup>
        <ActionButton
          class="full-width-button"
          primary
          :text="t('timeTools.convert')"
          :icon="RefreshCw"
          @click="convertDateToTimestamp"
        />
        <div class="result-group">
          <ResultItem :label="t('timeTools.second')" :value="secondResult" />
          <ResultItem
            :label="t('timeTools.millisecond')"
            :value="millisecondResult"
            class="mb0"
          />
        </div>
      </Panel>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useTranslation } from "@/utils/i18n";
import { Copy, RefreshCw, Check } from "lucide-vue-next";
import dayjs from "dayjs";

const { t } = useTranslation();

// 当前时间戳和日期
const currentTimestamp = ref(Math.floor(Date.now() / 1000));
const currentDateTime = ref(new Date().toLocaleString());

// 时间戳转日期
const timestampInput = ref("");
const localTimeResult = ref("");
const utcTimeResult = ref("");
const isoTimeResult = ref("");
const weekdayResult = ref("");

// 日期转时间戳
const dateInput = ref(dayjs().format("YYYY-MM-DDTHH:mm:ss"));
const secondResult = ref("");
const millisecondResult = ref("");

// 复制按钮状态
const isSecondCopied = ref(false);
const isMillisecondCopied = ref(false);

// 定时器
let timer: number | null = null;

// 实时更新当前时间
const updateCurrentTime = () => {
  currentTimestamp.value = Math.floor(Date.now() / 1000);
  currentDateTime.value = dayjs().format("YYYY-MM-DD HH:mm:ss");
};

// 复制时间戳
const copyTimestamp = (type: "second" | "millisecond") => {
  const value =
    type === "second"
      ? currentTimestamp.value.toString()
      : Date.now().toString();
  navigator.clipboard.writeText(value).then(() => {
    // 更新复制按钮状态
    if (type === "second") {
      isSecondCopied.value = true;
      // 2秒后重置状态
      setTimeout(() => {
        isSecondCopied.value = false;
      }, 2000);
    } else {
      isMillisecondCopied.value = true;
      // 2秒后重置状态
      setTimeout(() => {
        isMillisecondCopied.value = false;
      }, 2000);
    }
  });
};

// 时间戳转日期
const convertTimestampToDate = () => {
  const timestamp = parseInt(timestampInput.value);
  if (isNaN(timestamp)) return;

  // 检查时间戳长度，13位为毫秒，10位为秒
  const date = dayjs(
    timestamp.toString().length === 13 ? timestamp : timestamp * 1000,
  );
  localTimeResult.value = date.format("YYYY-MM-DD HH:mm:ss");
  // 使用JavaScript内置方法处理UTC时间
  const utcDate = new Date(date.valueOf());
  utcTimeResult.value = utcDate.toUTCString();
  isoTimeResult.value = date.toISOString();
  weekdayResult.value = ["日", "一", "二", "三", "四", "五", "六"][date.day()];
};

// 日期转时间戳
const convertDateToTimestamp = () => {
  const date = dayjs(dateInput.value);
  if (!date.isValid()) return;

  secondResult.value = Math.floor(date.valueOf() / 1000).toString();
  millisecondResult.value = date.valueOf().toString();
};

// 组件挂载时启动定时器
onMounted(() => {
  updateCurrentTime();
  timer = window.setInterval(updateCurrentTime, 1000);
});

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<style scoped lang="scss">
.current-timestamp {
  background-color: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 24px;

  .current-time-header {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 12px;
  }

  .current-time-value {
    font-size: 28px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .current-date-time {
    font-size: 14px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .copy-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
}

.conversion-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  :deep(.full-width-button) {
    width: 100%;
    justify-content: center;
    margin-bottom: 16px;
  }

  .result-group {
    /* ResultItem组件已经包含了样式 */
  }
}
</style>
