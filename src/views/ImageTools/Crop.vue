<template>
  <ToolPageLayout
    :title="t('imageTools.crop.title')"
    :description="t('imageTools.crop.description')"
  >
    <!-- 上传区域 -->
    <FileUploadArea
      v-if="!imageUrl"
      :text="t('imageTools.uploadText')"
      :subtext="t('imageTools.crop.uploadSubtext')"
      accept="image/png,image/jpeg,image/webp,image/bmp"
      :multiple="false"
      :is-dragging="isDragging"
      @select="handleFileSelect"
      @dragover="setDragging(true)"
      @dragleave="setDragging(false)"
    />

    <!-- 裁剪工具 -->
    <div v-else class="crop-container">
      <!-- 控制栏 -->
      <div class="control-bar">
        <!-- 纵横比选择 -->
        <InputGroup :label="t('imageTools.crop.aspectRatio')">
          <div class="aspect-ratio-buttons">
            <button
              v-for="ratio in aspectRatios"
              :key="ratio.value"
              class="ratio-button"
              :class="{ active: selectedRatio === ratio.value }"
              @click="setAspectRatio(ratio.value)"
            >
              {{ ratio.label }}
            </button>
          </div>
        </InputGroup>

        <!-- 自定义比例 -->
        <InputGroup :label="t('imageTools.crop.customRatio')">
          <div class="custom-ratio-inputs">
            <input
              type="number"
              v-model.number="customWidth"
              min="1"
              placeholder="W"
              class="input-field"
            />
            <span>:</span>
            <input
              type="number"
              v-model.number="customHeight"
              min="1"
              placeholder="H"
              class="input-field"
            />
            <ActionButton
              :text="t('imageTools.crop.apply')"
              @click="applyCustomRatio"
            />
          </div>
        </InputGroup>

        <!-- 裁剪尺寸 -->
        <InputGroup :label="t('imageTools.crop.cropSize')">
          <div class="crop-size-inputs">
            <input
              type="number"
              v-model.number="cropWidth"
              min="1"
              class="input-field"
            />
            <span>×</span>
            <input
              type="number"
              v-model.number="cropHeight"
              min="1"
              class="input-field"
            />
            <span>px</span>
          </div>
        </InputGroup>

        <!-- 变换工具 -->
        <InputGroup :label="t('imageTools.crop.transform')">
          <div class="transform-buttons">
            <ActionButton
              :icon="RotateCcw"
              @click="rotate(-90)"
              :title="t('imageTools.crop.rotateLeft')"
            />
            <ActionButton
              :icon="RotateCw"
              @click="rotate(90)"
              :title="t('imageTools.crop.rotateRight')"
            />
            <ActionButton
              :icon="FlipHorizontal"
              @click="flip('horizontal')"
              :title="t('imageTools.crop.flipHorizontal')"
            />
            <ActionButton
              :icon="FlipVertical"
              @click="flip('vertical')"
              :title="t('imageTools.crop.flipVertical')"
            />
          </div>
        </InputGroup>
      </div>

      <!-- 裁剪区域 -->
      <div class="crop-area">
        <img
          ref="imageRef"
          :src="imageUrl"
          class="crop-image"
          alt="Crop Image"
        />
      </div>

      <!-- 裁剪预览 -->
      <div class="preview-section">
        <h3>{{ t("imageTools.crop.preview") }}</h3>
        <div class="preview-container">
          <img ref="previewRef" class="preview-image" alt="Preview" />
          <div v-if="cropData" class="preview-info">
            {{ Math.round(cropData.width) }} ×
            {{ Math.round(cropData.height) }} px
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <ActionButton
            :text="t('imageTools.crop.reselect')"
            @click="reselectImage"
          />
          <div class="download-section">
            <select v-model="outputFormat" class="format-select">
              <option value="png">PNG</option>
              <option value="jpeg">JPG</option>
              <option value="webp">WebP</option>
            </select>
            <ActionButton
              primary
              :text="t('imageTools.crop.download')"
              :icon="Download"
              @click="downloadImage"
            />
          </div>
        </div>
      </div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useTranslation } from "@/utils/i18n";
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Download,
} from "lucide-vue-next";

const { t } = useTranslation();

// 状态
const imageUrl = ref("");
const imageFile = ref<File | null>(null);
const isDragging = ref(false);
const selectedRatio = ref("free");
const customWidth = ref(1);
const customHeight = ref(1);
const cropWidth = ref(0);
const cropHeight = ref(0);
const outputFormat = ref("png");
const cropData = ref<any>(null);

// 引用
const imageRef = ref<HTMLImageElement>();
const previewRef = ref<HTMLImageElement>();
const cropper = ref<Cropper | null>(null);

// 纵横比选项
const aspectRatios = [
  { label: t("imageTools.crop.free"), value: "free" },
  { label: "1:1", value: "1:1" },
  { label: "4:3", value: "4:3" },
  { label: "16:9", value: "16:9" },
  { label: "3:2", value: "3:2" },
  { label: "2:3", value: "2:3" },
  { label: "9:16", value: "9:16" },
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

// 初始化裁剪器
const initCropper = () => {
  if (imageRef.value) {
    cropper.value = new Cropper(imageRef.value, {
      aspectRatio: 1 / 1,
      viewMode: 1,
      autoCropArea: 0.8,
      responsive: true,
      restore: false,
      guides: true,
      center: true,
      highlight: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: true,
      crop: (e) => {
        cropData.value = e.detail;
        cropWidth.value = Math.round(e.detail.width);
        cropHeight.value = Math.round(e.detail.height);
      },
      cropend: () => {
        // 只在拖动结束后更新预览
        updatePreview();
      },
      ready: () => {
        // 裁剪器初始化完成后立即更新预览
        updatePreview();
      },
    });
  }
};

// 节流函数
const throttle = (func: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  return (...args: any[]) => {
    if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        func(...args);
        timeoutId = null;
      }, delay);
    }
  };
};

// 更新预览（节流优化）
const updatePreview = throttle(() => {
  if (cropper.value && previewRef.value) {
    previewRef.value.src = cropper.value.getCroppedCanvas().toDataURL();
  }
}, 100);

// 设置纵横比
const setAspectRatio = (ratio: string) => {
  selectedRatio.value = ratio;
  if (cropper.value) {
    let aspectRatio = NaN;
    if (ratio !== "free") {
      const [w, h] = ratio.split(":").map(Number);
      aspectRatio = w / h;
    }
    cropper.value.setAspectRatio(aspectRatio);
    // 设置纵横比后更新预览
    updatePreview();
  }
};

// 应用自定义比例
const applyCustomRatio = () => {
  if (customWidth.value > 0 && customHeight.value > 0) {
    selectedRatio.value = `${customWidth.value}:${customHeight.value}`;
    if (cropper.value) {
      cropper.value.setAspectRatio(customWidth.value / customHeight.value);
      // 应用自定义比例后更新预览
      updatePreview();
    }
  }
};

// 旋转
const rotate = (degrees: number) => {
  if (cropper.value) {
    cropper.value.rotate(degrees);
    // 旋转后更新预览
    updatePreview();
  }
};

// 翻转
const flip = (direction: "horizontal" | "vertical") => {
  if (cropper.value) {
    if (direction === "horizontal") {
      cropper.value.scaleX(-cropper.value.getData().scaleX);
    } else {
      cropper.value.scaleY(-cropper.value.getData().scaleY);
    }
    // 翻转后更新预览
    updatePreview();
  }
};

// 重新选择图片
const reselectImage = () => {
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
  imageUrl.value = "";
  imageFile.value = null;
  cropData.value = null;
  cropWidth.value = 0;
  cropHeight.value = 0;
};

// 下载图片
const downloadImage = () => {
  if (cropper.value) {
    const canvas = cropper.value.getCroppedCanvas();
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `cropped-image.${outputFormat.value}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }, `image/${outputFormat.value}`);
  }
};

// 监听图片加载完成
watch(imageUrl, (newUrl) => {
  if (newUrl) {
    // 等待图片加载完成后初始化裁剪器
    setTimeout(initCropper, 100);
  }
});

// 组件卸载时清理
onUnmounted(() => {
  if (cropper.value) {
    cropper.value.destroy();
  }
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value);
  }
});
</script>

<style scoped lang="scss">
.crop-container {
  display: flex;
  flex-direction: column;
  gap: 24px;

  .control-bar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, auto);
    gap: 20px;
    padding: 20px;
    background-color: var(--bg-secondary);
    border-radius: 8px;

    .aspect-ratio-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .ratio-button {
        padding: 6px 12px;
        border: 1px solid var(--border-color);
        border-radius: 20px;
        background-color: var(--bg-primary);
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 13px;

        &:hover {
          border-color: var(--primary-color);
          color: var(--primary-color);
        }

        &.active {
          background-color: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
      }
    }

    .custom-ratio-inputs {
      display: flex;
      align-items: center;
      gap: 8px;

      .input-field {
        width: 60px;
        padding: 6px 8px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--bg-primary);
        color: var(--text-primary);
        text-align: center;
      }

      span {
        color: var(--text-secondary);
      }
    }

    .crop-size-inputs {
      display: flex;
      align-items: center;
      gap: 8px;

      .input-field {
        width: 80px;
        padding: 6px 8px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background-color: var(--bg-primary);
        color: var(--text-primary);
        text-align: center;
      }

      span {
        color: var(--text-secondary);
      }
    }

    .transform-buttons {
      display: flex;
      gap: 8px;
    }
  }

  .crop-area {
    position: relative;
    width: 100%;
    height: 450px;
    background-color: var(--bg-secondary);
    border-radius: 8px;
    padding: 20px;
    display: flex;
    justify-content: center;
    align-items: center;

    .crop-image {
      max-width: 100%;
      max-height: 100%;
    }

    :deep(cropper-canvas) {
      height: 100%;
      width: 100%;
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
      flex-direction: column;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;

      .preview-image {
        max-width: 100%;
        max-height: 300px;
        border-radius: 4px;
        box-shadow: var(--shadow-sm);
      }

      .preview-info {
        font-size: 13px;
        color: var(--text-secondary);
      }
    }

    .action-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .download-section {
        display: flex;
        align-items: center;
        gap: 12px;

        .format-select {
          padding: 6px 12px;
          border: 1px solid var(--border-color);
          border-radius: 4px;
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .crop-container {
    .control-bar {
      grid-template-columns: 1fr;
    }

    .action-buttons {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;

      .download-section {
        justify-content: center;
      }
    }
  }
}
</style>
