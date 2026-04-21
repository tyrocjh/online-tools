<template>
  <ToolPageLayout :title="t('ip.title')" :description="t('ip.description')">
    <div class="ip-query">
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <ActionButton
          primary
          :text="t('ip.refresh')"
          :icon="RefreshCw"
          @click="fetchIPInfo"
          :disabled="isLoading"
        />
        <ActionButton
          :text="copySuccess ? '已复制' : t('ip.copyIP')"
          :icon="copySuccess ? Check : Copy"
          @click="copyIP"
          :disabled="!ipInfo.ip || copySuccess"
        />
      </div>

      <!-- IP地址显示 -->
      <div class="ip-display">
        <div class="ip-label">{{ t("ip.yourIP") }}</div>
        <div class="ip-value" v-if="isLoading">
          <div class="loading-spinner"></div>
        </div>
        <div class="ip-value" v-else>{{ ipInfo.ip || t("ip.loading") }}</div>
      </div>

      <!-- IP信息网格 -->
      <div class="ip-info-grid">
        <ResultItem
          :label="t('ip.country')"
          :value="`${ipInfo.country_name || '-'}`"
        />
        <ResultItem :label="t('ip.region')" :value="ipInfo.region || '-'" />
        <ResultItem :label="t('ip.city')" :value="ipInfo.city || '-'" />
        <ResultItem :label="t('ip.isp')" :value="ipInfo.org || '-'" />
        <ResultItem :label="t('ip.timezone')" :value="ipInfo.timezone || '-'" />
        <ResultItem
          :label="t('ip.latitude')"
          :value="`${ipInfo.latitude || '-'}`"
        />
        <ResultItem
          :label="t('ip.longitude')"
          :value="`${ipInfo.longitude || '-'}`"
        />
        <ResultItem :label="t('ip.asn')" :value="ipInfo.asn || '-'" />
      </div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useTranslation } from "@/utils/i18n";
import ActionButton from "@/components/common/ActionButton.vue";
import ResultItem from "@/components/common/ResultItem.vue";
import { RefreshCw, Copy, Check } from "lucide-vue-next";

const { t } = useTranslation();

// IP信息类型定义
interface IPInfo {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string | null;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
}

// 状态
const ipInfo = ref<Partial<IPInfo>>({
  ip: "",
});
const isLoading = ref(false);
const copySuccess = ref(false);

// 获取IP信息
const fetchIPInfo = async () => {
  isLoading.value = true;
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (response.ok) {
      const data = await response.json();
      ipInfo.value = data;
    } else {
      console.error("Failed to fetch IP info:", response.status);
    }
  } catch (error) {
    console.error("Error fetching IP info:", error);
  } finally {
    isLoading.value = false;
  }
};

// 复制IP地址
const copyIP = async () => {
  if (ipInfo.value.ip) {
    try {
      await navigator.clipboard.writeText(ipInfo.value.ip);
      copySuccess.value = true;
      // 2秒后重置状态
      setTimeout(() => {
        copySuccess.value = false;
      }, 2000);
    } catch (error) {
      console.error("Failed to copy IP:", error);
    }
  }
};

// 初始化
onMounted(() => {
  fetchIPInfo();
});
</script>

<style scoped lang="scss">
.ip-query {
  margin: 0 auto;
  padding: 24px;

  .action-buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 32px;
  }

  .ip-display {
    text-align: center;
    margin-bottom: 32px;

    .ip-label {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .ip-value {
      font-size: 32px;
      font-weight: bold;
      color: var(--text-primary);
      font-family: "Consolas", "Monaco", "Courier New", monospace;

      .loading-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: var(--primary-color);
        animation: spin 1s ease-in-out infinite;
        margin: 0 auto;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    }
  }

  .ip-info-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .ip-query {
    padding: 16px;

    .action-buttons {
      flex-direction: column;
    }

    .ip-value {
      font-size: 24px;
    }

    .ip-info-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
