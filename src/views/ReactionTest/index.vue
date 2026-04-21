<template>
  <ToolPageLayout
    :title="t('reactionTest.title')"
    :description="t('reactionTest.description')"
  >
    <div class="reaction-test">
      <!-- 点击区域 -->
      <div
        class="click-area"
        :class="{
          active: isActive,
          ready: isReady,
          waiting: isWaiting,
        }"
        @click="handleClick"
      >
        <div v-if="!isReady" class="click-text">
          {{ t("reactionTest.clickToStart") }}
        </div>
        <div v-else-if="isWaiting" class="click-text">
          {{ t("reactionTest.waiting") }}
        </div>
        <div v-else-if="isActive" class="click-text">
          {{ t("reactionTest.clickNow") }}
        </div>
        <div v-else class="result-text">
          <div class="result-title">{{ t("reactionTest.yourTime") }}</div>
          <div class="result-time">
            {{ lastReactionTime }} {{ t("reactionTest.milliseconds") }}
          </div>
          <div class="result-subtitle">
            {{ t("reactionTest.clickToStart") }}
          </div>
        </div>
      </div>

      <!-- 统计信息 -->
      <div class="stats-container">
        <ResultItem
          :label="t('reactionTest.best')"
          :value="
            bestTime ? bestTime + ' ' + t('reactionTest.milliseconds') : '-'
          "
        />
        <ResultItem
          :label="t('reactionTest.average')"
          :value="
            averageTime
              ? averageTime + ' ' + t('reactionTest.milliseconds')
              : '-'
          "
        />
        <ResultItem
          :label="t('reactionTest.times')"
          :value="reactionTimes.length.toString()"
        />
      </div>

      <!-- 次数列表 -->
      <div class="times-container">
        <h3>{{ t("reactionTest.times") }}</h3>
        <div class="times-list">
          <div
            v-for="(time, index) in reactionTimes"
            :key="index"
            class="time-item"
          >
            {{ t("reactionTest.round") }} {{ index + 1 }}: {{ time }}
            {{ t("reactionTest.milliseconds") }}
          </div>
        </div>
      </div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useTranslation } from "@/utils/i18n";
import ResultItem from "@/components/common/ResultItem.vue";

const { t } = useTranslation();

// 状态
const isReady = ref(false);
const isActive = ref(false);
const isWaiting = ref(false);
const startTime = ref<number>(0);
const endTime = ref<number>(0);
const lastReactionTime = ref<number>(0);
const reactionTimes = ref<number[]>([]);

// 计算属性
const bestTime = computed(() => {
  if (reactionTimes.value.length === 0) return null;
  return Math.min(...reactionTimes.value);
});

const averageTime = computed(() => {
  if (reactionTimes.value.length === 0) return null;
  const sum = reactionTimes.value.reduce((acc, time) => acc + time, 0);
  return Math.round(sum / reactionTimes.value.length);
});

// 处理点击
const handleClick = () => {
  if (!isReady.value) {
    // 第一次点击，开始准备
    isReady.value = true;
    startNextRound();
  } else if (isWaiting.value) {
    // 等待阶段点击，不做任何操作
    return;
  } else if (isActive.value) {
    // 点击目标
    endTime.value = Date.now();
    const reactionTime = endTime.value - startTime.value;
    lastReactionTime.value = reactionTime;
    reactionTimes.value.push(reactionTime);
    isActive.value = false;
    // 测试结束后停留在结果界面，不自动开始下一轮
  } else {
    // 点击开始新一轮
    startNextRound();
  }
};

// 开始下一轮
const startNextRound = () => {
  // 进入等待状态
  isWaiting.value = true;
  // 随机延迟 2-5 秒
  const delay = Math.random() * 3000 + 2000;
  setTimeout(() => {
    isWaiting.value = false;
    isActive.value = true;
    startTime.value = Date.now();
  }, delay);
};

// 初始化
onMounted(() => {
  // 初始状态
  isReady.value = false;
  isActive.value = false;
  isWaiting.value = false;
});
</script>

<style scoped lang="scss">
.reaction-test {
  margin: 0 auto;
  padding: 24px;

  .click-area {
    width: 100%;
    height: 200px;
    border: 2px solid var(--border-light-color);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 24px;

    &:hover {
      border-color: var(--primary-color);
    }

    &.active {
      background-color: #4caf50;
      border-color: #4caf50;
      color: white;
    }

    &.waiting {
      background-color: #f44336;
      border-color: #f44336;
      color: white;
    }

    .click-text {
      font-size: 24px;
      font-weight: bold;
      color: var(--text-primary);
    }

    .result-text {
      text-align: center;

      .result-title {
        font-size: 16px;
        color: var(--text-secondary);
        margin-bottom: 8px;
      }

      .result-time {
        font-size: 32px;
        font-weight: bold;
        color: var(--text-primary);
        margin-bottom: 8px;
      }

      .result-subtitle {
        font-size: 14px;
        color: var(--text-secondary);
      }
    }
  }

  .stats-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .times-container {
    background-color: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    h3 {
      font-size: 16px;
      font-weight: bold;
      color: var(--text-primary);
      margin-bottom: 16px;
    }

    .times-list {
      .time-item {
        padding: 8px 0;
        border-bottom: 1px solid var(--border-light-color);

        &:last-child {
          border-bottom: none;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .reaction-test {
    padding: 16px;

    .click-area {
      height: 150px;

      .click-text {
        font-size: 20px;
      }

      .result-time {
        font-size: 24px;
      }
    }

    .stats-container {
      grid-template-columns: 1fr;
    }
  }
}
</style>
