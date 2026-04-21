<template>
  <ToolPageLayout
    :title="t('imageTools.watermark.title')"
    :description="t('imageTools.watermark.description')"
  >
    <!-- 上传区域 -->
    <FileUploadArea
      v-if="!imageUrl"
      :text="t('imageTools.uploadText')"
      :subtext="t('imageTools.watermark.uploadSubtext')"
      accept="image/png,image/jpeg,image/webp"
      :multiple="false"
      :is-dragging="isDragging"
      @select="handleFileSelect"
      @dragover="setDragging(true)"
      @dragleave="setDragging(false)"
    />

    <!-- 水印工具 -->
    <div v-else class="watermark-container">
      <!-- 控制栏 -->
      <div class="control-bar">
        <div class="control-left">
          <!-- 水印文字 -->
          <InputGroup :label="t('imageTools.watermark.text')">
            <input
              type="text"
              v-model="watermarkText"
              :placeholder="t('imageTools.watermark.textPlaceholder')"
              class="input-field"
              @input="updatePreview"
            />
          </InputGroup>

          <!-- 颜色选择 -->
          <InputGroup :label="t('imageTools.watermark.color')">
            <div class="color-selector">
              <input
                type="color"
                v-model="watermarkColor"
                class="color-input"
                @input="updatePreview"
              />
            </div>
          </InputGroup>

          <!-- 平铺模式 -->
          <InputGroup :label="t('imageTools.watermark.tileMode')">
            <div class="tile-mode-options">
              <label class="checkbox-label">
                <input
                  type="checkbox"
                  v-model="tileMode"
                  @change="updatePreview"
                />
                {{ t("imageTools.watermark.tileAll") }}
              </label>
              <div v-if="tileMode" class="tile-spacing">
                <span>{{ t("imageTools.watermark.spacing") }}:</span>
                <input
                  type="number"
                  v-model.number="tileSpacing"
                  min="10"
                  max="200"
                  class="input-field small"
                  @input="updatePreview"
                />
                <span>px</span>
              </div>
            </div>
          </InputGroup>

          <!-- 位置选择 -->
          <InputGroup :label="t('imageTools.watermark.position')">
            <div class="position-grid">
              <button
                v-for="(pos, index) in positions"
                :key="index"
                class="position-button"
                :class="{ active: position === pos.value }"
                @click="setPosition(pos.value)"
                :title="pos.label"
              >
                <component :is="pos.icon" class="position-icon" />
              </button>
            </div>
          </InputGroup>
        </div>

        <div class="control-right">
          <!-- 字体大小 -->
          <InputGroup :label="t('imageTools.watermark.fontSize')">
            <div class="slider-container">
              <input
                type="range"
                class="range-input slider"
                v-model.number="fontSize"
                min="10"
                max="100"
                @input="updatePreview"
              />
              <span class="slider-value">{{ fontSize }}px</span>
            </div>
          </InputGroup>

          <!-- 不透明度 -->
          <InputGroup :label="t('imageTools.watermark.opacity')">
            <div class="slider-container">
              <input
                type="range"
                class="range-input slider"
                v-model.number="opacity"
                min="10"
                max="100"
                @input="updatePreview"
              />
              <span class="slider-value">{{ opacity }}%</span>
            </div>
          </InputGroup>

          <!-- 旋转角度 -->
          <InputGroup :label="t('imageTools.watermark.rotation')">
            <div class="slider-container">
              <input
                type="range"
                class="range-input slider"
                v-model.number="rotation"
                min="-180"
                max="180"
                @input="updatePreview"
              />
              <span class="slider-value">{{ rotation }}°</span>
            </div>
          </InputGroup>
        </div>
      </div>

      <!-- 预览区域 -->
      <div class="preview-section">
        <h3>{{ t("imageTools.watermark.preview") }}</h3>
        <div class="preview-container">
          <img ref="previewRef" class="preview-image" alt="Preview" />
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <ActionButton
            :text="t('imageTools.watermark.reselect')"
            @click="reselectImage"
          />
          <ActionButton
            primary
            :text="t('imageTools.watermark.download')"
            :icon="Download"
            @click="downloadImage"
          />
        </div>
      </div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useTranslation } from "@/utils/i18n";
import {
  Download,
  Circle,
  ArrowUpLeft,
  ArrowUp,
  ArrowUpRight,
  ArrowLeft,
  ArrowRight,
  ArrowDownLeft,
  ArrowDown,
  ArrowDownRight,
} from "lucide-vue-next";

const { t } = useTranslation();

// 状态
const imageUrl = ref("");
const imageFile = ref<File | null>(null);
const isDragging = ref(false);
const watermarkText = ref("Sample Watermark");
const fontSize = ref(63);
const opacity = ref(24);
const rotation = ref(-39);
const watermarkColor = ref("#FF0000");
const tileMode = ref(true);
const tileSpacing = ref(50);
const position = ref("center");

// 引用
const previewRef = ref<HTMLImageElement>();

// 位置选项
const positions = [
  {
    label: t("imageTools.watermark.positions.topLeft"),
    value: "topLeft",
    icon: ArrowUpLeft,
  },
  {
    label: t("imageTools.watermark.positions.topCenter"),
    value: "topCenter",
    icon: ArrowUp,
  },
  {
    label: t("imageTools.watermark.positions.topRight"),
    value: "topRight",
    icon: ArrowUpRight,
  },
  {
    label: t("imageTools.watermark.positions.left"),
    value: "left",
    icon: ArrowLeft,
  },
  {
    label: t("imageTools.watermark.positions.center"),
    value: "center",
    icon: Circle,
  },
  {
    label: t("imageTools.watermark.positions.right"),
    value: "right",
    icon: ArrowRight,
  },
  {
    label: t("imageTools.watermark.positions.bottomLeft"),
    value: "bottomLeft",
    icon: ArrowDownLeft,
  },
  {
    label: t("imageTools.watermark.positions.bottomCenter"),
    value: "bottomCenter",
    icon: ArrowDown,
  },
  {
    label: t("imageTools.watermark.positions.bottomRight"),
    value: "bottomRight",
    icon: ArrowDownRight,
  },
];

// 设置拖拽状态
const setDragging = (dragging: boolean) => {
  isDragging.value = dragging;
};

// 处理文件选择
const handleFileSelect = (files: FileList) => {
  if (files.length > 0) {
    const file = files[0];
    imageFile.value = file;
    imageUrl.value = URL.createObjectURL(file);
  }
};

// 设置位置
const setPosition = (pos: string) => {
  position.value = pos;
  updatePreview();
};

// 更新预览
const updatePreview = () => {
  if (!imageUrl.value || !previewRef.value) return;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    // 绘制原始图片
    ctx.drawImage(img, 0, 0);

    // 绘制水印
    if (watermarkText.value) {
      ctx.globalAlpha = opacity.value / 100;
      ctx.fillStyle = watermarkColor.value;
      ctx.font = `${fontSize.value}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.save();

      if (tileMode.value) {
        // 平铺模式
        const textWidth = ctx.measureText(watermarkText.value).width;
        const spacing = tileSpacing.value;
        const diagonal = Math.sqrt(
          img.width * img.width + img.height * img.height,
        );

        ctx.translate(img.width / 2, img.height / 2);
        ctx.rotate((rotation.value * Math.PI) / 180);
        ctx.translate(-img.width / 2, -img.height / 2);

        for (let x = -diagonal; x < diagonal; x += textWidth + spacing) {
          for (let y = -diagonal; y < diagonal; y += fontSize.value + spacing) {
            ctx.fillText(watermarkText.value, x, y);
          }
        }
      } else {
        // 单个水印
        let x = img.width / 2;
        let y = img.height / 2;

        switch (position.value) {
          case "topLeft":
            x = fontSize.value;
            y = fontSize.value;
            break;
          case "topCenter":
            x = img.width / 2;
            y = fontSize.value;
            break;
          case "topRight":
            x = img.width - fontSize.value;
            y = fontSize.value;
            break;
          case "left":
            x = fontSize.value;
            y = img.height / 2;
            break;
          case "right":
            x = img.width - fontSize.value;
            y = img.height / 2;
            break;
          case "bottomLeft":
            x = fontSize.value;
            y = img.height - fontSize.value;
            break;
          case "bottomCenter":
            x = img.width / 2;
            y = img.height - fontSize.value;
            break;
          case "bottomRight":
            x = img.width - fontSize.value;
            y = img.height - fontSize.value;
            break;
        }

        // 移动到水印位置的中心点，然后旋转，这样旋转会围绕水印中心进行
        ctx.translate(x, y);
        ctx.rotate((rotation.value * Math.PI) / 180);
        ctx.translate(-x, -y);

        ctx.fillText(watermarkText.value, x, y);
      }

      ctx.restore();
    }

    // 更新预览
    previewRef.value.src = canvas.toDataURL();
  };
  img.src = imageUrl.value;
};

// 重新选择图片
const reselectImage = () => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
  imageUrl.value = "";
  imageFile.value = null;
};

// 下载图片
const downloadImage = () => {
  if (!previewRef.value) return;

  const link = document.createElement("a");
  link.href = previewRef.value.src;
  link.download = `watermarked-image.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 监听图片加载完成
watch(imageUrl, (newUrl) => {
  if (newUrl) {
    // 等待图片加载完成后更新预览
    setTimeout(updatePreview, 100);
  }
});
</script>

<style scoped lang="scss">
.watermark-container {
  display: flex;
  flex-direction: column;
  gap: 24px;

  .control-bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 20px;
    background-color: var(--bg-secondary);
    border-radius: 12px;
    margin-bottom: 24px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }

    .control-left,
    .control-right {
      display: flex;
      flex-direction: column;
      gap: 20px;

      .input-group {
        margin-bottom: 0;
      }

      .slider-container {
        display: flex;
        align-items: center;
        gap: 12px;

        .slider {
          flex: 1;
          height: 6px;
          background: var(--border-light-color);
          border-radius: 3px;
          outline: none;

          &::-webkit-slider-thumb {
            width: 16px;
            height: 16px;
            background: var(--primary-color);
            border-radius: 50%;
            cursor: pointer;
          }

          &::-moz-range-thumb {
            width: 16px;
            height: 16px;
            background: var(--primary-color);
            border-radius: 50%;
            cursor: pointer;
            border: none;
          }
        }

        .slider-value {
          font-size: 13px;
          color: var(--text-secondary);
          min-width: 60px;
        }
      }

      .color-selector {
        display: flex;
        align-items: center;
        gap: 12px;

        .color-input {
          padding: 5px;
          width: 40px;
          height: 40px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          cursor: pointer;
          background: none;
        }

        .color-value {
          font-size: 13px;
          color: var(--text-secondary);
          font-family: monospace;
        }
      }

      .tile-mode-options {
        display: flex;
        gap: 8px;

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 13px;
          color: var(--text-primary);
        }

        .tile-spacing {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: 24px;
          font-size: 14px;

          .input-field.small {
            padding: 5px 10px;
            width: 80px;
          }
        }
      }

      .position-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        width: 150px;

        .position-button {
          width: 30px;
          height: 30px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background-color: var(--bg-primary);
          color: var(--text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;

          &:hover {
            border-color: var(--primary-color);
            color: var(--primary-color);
          }

          &.active {
            background-color: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
          }

          .position-icon {
            width: 16px;
            height: 16px;
          }
        }
      }
    }
  }

  .preview-section {
    padding: 20px;
    background-color: var(--bg-secondary);
    border-radius: 8px;

    h3 {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 16px;
    }

    .preview-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 20px;

      .preview-image {
        max-width: 100%;
        max-height: 400px;
        border-radius: 4px;
        box-shadow: var(--shadow-sm);
      }
    }

    .action-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}

@media (max-width: 768px) {
  .watermark-container {
    .action-buttons {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
  }
}
</style>
