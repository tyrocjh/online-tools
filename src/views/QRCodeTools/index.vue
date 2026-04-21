<template>
  <ToolPageLayout
    :title="t('qrcode.title')"
    :description="t('qrcode.description')"
  >
    <div class="qrcode-generator">
      <!-- 左侧配置区 -->
      <div class="config-section">
        <!-- 类型选择 -->
        <LanguageSelector
          class="type-selector"
          :languages="types"
          :currentLanguage="activeType"
          @select="selectType"
        />

        <!-- 内容输入 -->
        <div class="content-section">
          <!-- 文本/链接 -->
          <div v-if="activeType === 'text'">
            <InputGroup :label="t('qrcode.content')">
              <textarea
                v-model="textContent"
                class="input-field"
                :placeholder="t('qrcode.contentPlaceholder')"
                @input="generateQRCode"
              ></textarea>
            </InputGroup>
          </div>

          <!-- WiFi -->
          <div v-else-if="activeType === 'wifi'">
            <InputGroup :label="t('qrcode.wifi.ssid')">
              <input
                v-model="wifiConfig.ssid"
                class="input-field"
                :placeholder="t('qrcode.wifi.ssidPlaceholder')"
                @input="generateQRCode"
              />
            </InputGroup>
            <InputGroup :label="t('qrcode.wifi.password')">
              <input
                v-model="wifiConfig.password"
                type="password"
                class="input-field"
                :placeholder="t('qrcode.wifi.passwordPlaceholder')"
                @input="generateQRCode"
              />
            </InputGroup>
            <InputGroup :label="t('qrcode.wifi.encryption')">
              <select
                v-model="wifiConfig.encryption"
                class="input-field"
                @change="generateQRCode"
              >
                <option value="WPA/WPA2">{{ t("qrcode.wifi.wpa") }}</option>
                <option value="WEP">{{ t("qrcode.wifi.wep") }}</option>
                <option value="none">{{ t("qrcode.wifi.none") }}</option>
              </select>
            </InputGroup>
          </div>

          <!-- 邮箱 -->
          <div v-else-if="activeType === 'email'">
            <InputGroup :label="t('qrcode.email.to')">
              <input
                v-model="emailConfig.to"
                type="email"
                class="input-field"
                :placeholder="t('qrcode.email.toPlaceholder')"
                @input="generateQRCode"
              />
            </InputGroup>
            <InputGroup :label="t('qrcode.email.subject')">
              <input
                v-model="emailConfig.subject"
                class="input-field"
                :placeholder="t('qrcode.email.subjectPlaceholder')"
                @input="generateQRCode"
              />
            </InputGroup>
            <InputGroup :label="t('qrcode.email.body')">
              <textarea
                v-model="emailConfig.body"
                class="input-field"
                :placeholder="t('qrcode.email.bodyPlaceholder')"
                @input="generateQRCode"
              ></textarea>
            </InputGroup>
          </div>

          <!-- 电话 -->
          <div v-else-if="activeType === 'phone'">
            <InputGroup :label="t('qrcode.phone.number')">
              <input
                v-model="phoneNumber"
                class="input-field"
                :placeholder="t('qrcode.phone.numberPlaceholder')"
                @input="generateQRCode"
              />
            </InputGroup>
          </div>
        </div>

        <!-- 颜色设置 -->
        <div class="color-section">
          <div class="color-inputs">
            <div class="color-item">
              <InputGroup :label="t('qrcode.foreground')">
                <div class="color-picker">
                  <input
                    v-model="foregroundColor"
                    type="color"
                    @change="generateQRCode"
                  />
                  <input
                    v-model="foregroundColor"
                    type="text"
                    class="color-text"
                    @input="generateQRCode"
                  />
                </div>
              </InputGroup>
            </div>
            <div class="color-item">
              <InputGroup :label="t('qrcode.background')">
                <div class="color-picker">
                  <input
                    v-model="backgroundColor"
                    type="color"
                    @change="generateQRCode"
                  />
                  <input
                    v-model="backgroundColor"
                    type="text"
                    class="color-text"
                    @input="generateQRCode"
                  />
                </div>
              </InputGroup>
            </div>
          </div>
        </div>

        <!-- 尺寸设置 -->
        <div class="size-section">
          <InputGroup :label="t('qrcode.size') + ': ' + size + ' × ' + size">
            <input
              v-model.number="size"
              class="size-slider range-input"
              type="range"
              min="128"
              max="256"
              step="32"
              @input="generateQRCode"
            />
          </InputGroup>
        </div>

        <!-- 容错级别 -->
        <div class="error-section">
          <InputGroup :label="t('qrcode.errorLevel')">
            <div class="error-selector">
              <button
                v-for="level in errorLevels"
                :key="level.value"
                class="error-btn"
                :class="{ active: errorLevel === level.value }"
                @click="
                  errorLevel = level.value;
                  generateQRCode();
                "
              >
                {{ level.label }}
              </button>
            </div>
          </InputGroup>
        </div>
      </div>

      <!-- 右侧预览区 -->
      <Panel class="preview-section">
        <h3>{{ t("qrcode.preview") }}</h3>
        <div class="qrcode-container">
          <canvas v-show="qrcodeData" ref="qrcodeCanvas"></canvas>
          <div v-if="!qrcodeData" class="empty-preview">
            {{ t("qrcode.emptyPreview") }}
          </div>
        </div>
        <div class="download-buttons">
          <ActionButton
            primary
            :text="t('qrcode.downloadPNG')"
            :icon="Download"
            @click="downloadPNG"
            :disabled="!qrcodeData"
          />
          <ActionButton
            :text="t('qrcode.downloadSVG')"
            :icon="Download"
            @click="downloadSVG"
            :disabled="!qrcodeData"
          />
        </div>
      </Panel>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useTranslation } from "@/utils/i18n";
import { useDownload } from "@/hooks/useDownload";
import ActionButton from "@/components/common/ActionButton.vue";
import Panel from "@/components/common/Panel.vue";
import LanguageSelector from "@/components/common/LanguageSelector.vue";
import InputGroup from "@/components/common/InputGroup.vue";
import { Download } from "lucide-vue-next";
import * as QRCode from "qrcode";

const { t } = useTranslation();
const { download } = useDownload();

// 类型定义
const types = [
  { label: t("qrcode.types.text"), value: "text" },
  { label: t("qrcode.types.wifi"), value: "wifi" },
  { label: t("qrcode.types.email"), value: "email" },
  { label: t("qrcode.types.phone"), value: "phone" },
];

// 容错级别
const errorLevels = [
  { label: "L", value: "L" },
  { label: "M", value: "M" },
  { label: "Q", value: "Q" },
  { label: "H", value: "H" },
];

// 状态
const activeType = ref("text");
const textContent = ref("https://github.com/tyrocjh/online-tools");

// 选择类型
const selectType = (type: string) => {
  activeType.value = type;
};
const wifiConfig = ref({
  ssid: "",
  password: "",
  encryption: "WPA/WPA2",
});
const emailConfig = ref({
  to: "user@example.com",
  subject: "",
  body: "",
});
const phoneNumber = ref("+86 138 0000 0000");
const foregroundColor = ref("#000000");
const backgroundColor = ref("#FFFFFF");
const size = ref(256);
const errorLevel = ref("M");
const qrcodeCanvas = ref<HTMLCanvasElement | null>(null);
const qrcodeData = ref<string | null>(null);

// 计算要生成的二维码内容
const qrContent = computed(() => {
  switch (activeType.value) {
    case "text":
      if (!textContent.value) return "";
      return textContent.value;
    case "wifi":
      const { ssid, password, encryption } = wifiConfig.value;
      if (!ssid) return "";
      return `WIFI:S:${ssid};T:${encryption === "none" ? "" : encryption};P:${password};H:;;`;
    case "email":
      const { to, subject, body } = emailConfig.value;
      if (!to) return "";
      let emailContent = `mailto:${to}`;
      if (subject || body) {
        emailContent += "?";
        if (subject) emailContent += `subject=${encodeURIComponent(subject)}`;
        if (subject && body) emailContent += "&";
        if (body) emailContent += `body=${encodeURIComponent(body)}`;
      }
      return emailContent;
    case "phone":
      if (!phoneNumber.value) return "";
      return `tel:${phoneNumber.value}`;
    default:
      return "";
  }
});

// 生成二维码
const generateQRCode = async () => {
  if (!qrContent.value) {
    qrcodeData.value = null;
    // 当内容为空时，清除canvas上的二维码
    if (qrcodeCanvas.value) {
      const ctx = qrcodeCanvas.value.getContext("2d");
      if (ctx) {
        ctx.clearRect(
          0,
          0,
          qrcodeCanvas.value.width,
          qrcodeCanvas.value.height,
        );
      }
    }
    return;
  }

  try {
    if (qrcodeCanvas.value) {
      await QRCode.toCanvas(qrcodeCanvas.value, qrContent.value, {
        width: size.value,
        margin: 1,
        color: {
          dark: foregroundColor.value,
          light: backgroundColor.value,
        },
        errorCorrectionLevel: errorLevel.value,
      });
      qrcodeData.value = qrcodeCanvas.value.toDataURL("image/png");
    }
  } catch (error) {
    console.error("Failed to generate QR code:", error);
  }
};

// 下载PNG
const downloadPNG = () => {
  if (qrcodeData.value) {
    download(qrcodeData.value, "qrcode.png");
  }
};

// 下载SVG
const downloadSVG = async () => {
  if (!qrContent.value) return;

  try {
    const svg = await QRCode.toString(qrContent.value, {
      type: "svg",
      margin: 1,
      color: {
        dark: foregroundColor.value,
        light: backgroundColor.value,
      },
      errorCorrectionLevel: errorLevel.value,
    });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    download(url, "qrcode.svg");
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to generate SVG:", error);
  }
};

// 监听类型变化
watch(activeType, generateQRCode);

// 监听内容变化
watch([textContent, wifiConfig, emailConfig, phoneNumber], generateQRCode, {
  deep: true,
});

// 初始化
onMounted(() => {
  generateQRCode();
});
</script>

<style scoped lang="scss">
.qrcode-generator {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 24px;

  .config-section {
    background-color: #fff;
    padding: 20px;
    border-radius: 12px;
    .type-selector {
      justify-content: space-between;
      margin-bottom: 12px;
      ::v-deep button {
        flex: 1;
      }
    }
    .content-section {
      margin-bottom: 12px;
    }

    .color-section {
      margin-bottom: 24px;

      h3 {
        font-size: 16px;
        font-weight: bold;
        color: var(--text-primary);
        margin-bottom: 16px;
      }

      .color-inputs {
        display: flex;
        gap: 16px;

        .color-item {
          flex: 1;

          label {
            display: block;
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 8px;
          }

          .color-picker {
            display: flex;
            gap: 8px;

            input[type="color"] {
              width: 40px;
              height: 40px;
              border: 1px solid var(--border-light-color);
              border-radius: 4px;
              cursor: pointer;
            }

            .color-text {
              flex: 1;
              padding: 10px 12px;
              border: 1px solid var(--border-light-color);
              border-radius: 8px;
              background-color: var(--bg-primary);
              color: var(--text-primary);
              font-size: 14px;

              &:focus {
                outline: none;
                border-color: var(--primary-color);
              }
            }
          }
        }
      }
    }

    .size-section {
      margin-bottom: 24px;

      h3 {
        font-size: 16px;
        font-weight: bold;
        color: var(--text-primary);
        margin-bottom: 16px;
      }

      .size-slider {
        width: 100%;
      }
    }

    .error-section {
      .error-selector {
        display: flex;
        justify-content: space-around;
        width: 250px;
        background-color: var(--bg-primary);
        border-radius: 9999px;
        padding: 4px;
        gap: 0;

        .error-btn {
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
    }
  }

  .preview-section {
    display: flex;
    flex-direction: column;

    h3 {
      font-size: 16px;
      font-weight: bold;
      color: var(--text-primary);
      margin-bottom: 16px;
    }

    .qrcode-container {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: white;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 24px;
      min-height: 300px;

      canvas {
        max-width: 100%;
        max-height: 100%;
      }

      .empty-preview {
        color: var(--text-secondary);
        font-size: 16px;
      }
    }

    .download-buttons {
      display: flex;
      gap: 12px;

      button {
        flex: 1;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .qrcode-generator {
    grid-template-columns: 1fr;

    .preview-section {
      .qrcode-container {
        min-height: 250px;
        padding: 16px;
      }
    }
  }
}
</style>
