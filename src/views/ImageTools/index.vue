<template>
  <ToolPageLayout
    :title="t('imageTools.title')"
    :description="t('imageTools.description')"
  >
    <!-- 上传区域 -->
    <FileUploadArea
      v-if="isEmpty"
      :text="t('imageTools.uploadText')"
      :subtext="t('imageTools.uploadSubtext')"
      accept="image/png,image/jpeg,image/webp"
      :multiple="true"
      :is-dragging="isDragging"
      @select="handleFileSelect"
      @dragover="setDragging(true)"
      @dragleave="setDragging(false)"
    />

    <!-- 压缩质量设置 -->
    <div class="compression-settings" v-if="!isEmpty">
      <div class="quality-control">
        <label>{{ t("imageTools.quality") }}</label>
        <input
          type="range"
          v-model.number="quality"
          class="range-input"
          min="10"
          max="100"
          step="5"
          @change="handleQualityChange"
        />
        <span class="quality-value">{{ quality }}%</span>
      </div>
      <div class="action-buttons">
        <ActionButton
          :text="t('imageTools.addMore')"
          :icon="Plus"
          @click="triggerAddMore"
        />
        <ActionButton
          :text="t('imageTools.clearAll')"
          :icon="Trash2"
          @click="handleClearAll"
        />
        <ActionButton
          primary
          :text="t('imageTools.downloadAll')"
          :icon="Download"
          @click="handleDownloadAll"
        />
      </div>
    </div>

    <!-- 压缩统计 -->
    <div class="compression-stats" v-if="!isEmpty">
      <div class="stat-item">{{ imageCount }} {{ t("imageTools.files") }}</div>
      <div class="stat-item">
        {{ formatFileSize(originalTotalSize) }}
        {{ t("imageTools.originalSize") }}
      </div>
      <div class="stat-item">
        {{ formatFileSize(compressedTotalSize) }}
        {{ t("imageTools.compressedSize") }}
      </div>
      <div class="stat-item savings">
        {{ totalSavingsPercentage.toFixed(1) }}% {{ t("imageTools.saved") }}
      </div>
    </div>

    <!-- 图片列表 -->
    <div class="image-list" v-if="!isEmpty">
      <div class="image-item" v-for="image in compressedImages" :key="image.id">
        <div class="image-preview">
          <img :src="image.compressedUrl" :alt="image.name" />
        </div>
        <div class="image-info">
          <div class="image-name">{{ image.name }}</div>
          <div class="image-stats">
            <span>{{ formatFileSize(image.originalSize) }}</span>
            <span class="arrow">→</span>
            <span>{{ formatFileSize(image.compressedSize) }}</span>
            <span class="savings"
              >{{ image.savingsPercentage.toFixed(1) }}%</span
            >
          </div>
        </div>
        <div class="image-actions">
          <ActionButton :icon="Download" @click="handleDownloadSingle(image)" />
          <ActionButton :icon="X" @click="removeImage(image.id)" />
        </div>
      </div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useTranslation } from "@/utils/i18n";
import { Plus, Trash2, Download, X } from "lucide-vue-next";
import {
  useImageCompression,
  type CompressedImage,
} from "@/hooks/useImageCompression";
import { useDownload } from "@/hooks/useDownload";

const { t } = useTranslation();

// 文件输入引用（用于添加更多）
const fileInputRef = ref<HTMLInputElement>();

// 使用 Hooks
const {
  quality,
  compressedImages,
  isCompressing,
  originalTotalSize,
  compressedTotalSize,
  totalSavingsPercentage,
  imageCount,
  isEmpty,
  compressImages,
  recompressAll,
  removeImage,
  clearImages,
} = useImageCompression({
  defaultQuality: 80,
});

const { download, downloadBatch, formatFileSize } = useDownload();

// 拖拽状态
const isDragging = ref(false);

// 设置拖拽状态
const setDragging = (dragging: boolean) => {
  isDragging.value = dragging;
};

// 处理文件选择
const handleFileSelect = async (files: FileList) => {
  const fileArray = Array.from(files);
  await compressImages(fileArray);
  setDragging(false);
};

// 处理质量改变
const handleQualityChange = async () => {
  await recompressAll(quality.value);
};

// 触发添加更多
const triggerAddMore = () => {
  // 创建临时 input 元素
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.accept = "image/png,image/jpeg,image/webp";
  input.onchange = (e) => {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      handleFileSelect(target.files);
    }
  };
  input.click();
};

// 处理清空所有
const handleClearAll = () => {
  clearImages();
};

// 处理批量下载
const handleDownloadAll = () => {
  const items = compressedImages.value.map((img) => ({
    url: img.compressedUrl,
    name: img.name,
  }));
  downloadBatch(items);
};

// 处理单个下载
const handleDownloadSingle = (image: CompressedImage) => {
  download(image.compressedUrl, image.name);
};
</script>

<style scoped lang="scss">
.compression-settings {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0 16px;
  padding: 16px;
  background-color: var(--bg-secondary);
  border-radius: 8px;

  .quality-control {
    display: flex;
    align-items: center;
    gap: 12px;

    label {
      font-size: 14px;
      color: var(--text-primary);
      white-space: nowrap;
    }

    input[type="range"] {
      width: 200px;
    }

    .quality-value {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-color);
      min-width: 40px;
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }
}

.compression-stats {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #e8f5e8;
  border-radius: 8px;

  .stat-item {
    font-size: 14px;
    color: var(--text-primary);

    &.savings {
      color: #28a745;
      font-weight: 500;
    }
  }
}

.image-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .image-item {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px;
    background-color: var(--bg-secondary);
    border-radius: 8px;

    .image-preview {
      width: 80px;
      height: 80px;
      border-radius: 4px;
      overflow: hidden;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .image-info {
      flex: 1;
      min-width: 0;

      .image-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .image-stats {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--text-secondary);

        .arrow {
          color: var(--text-light);
        }

        .savings {
          color: #28a745;
          font-weight: 500;
        }
      }
    }

    .image-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
    }
  }
}

@media (max-width: 768px) {
  .compression-settings {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .quality-control {
      width: 100%;

      input[type="range"] {
        flex: 1;
      }
    }

    .action-buttons {
      width: 100%;
      justify-content: space-between;
    }
  }

  .compression-stats {
    flex-wrap: wrap;
    gap: 12px;
  }

  .image-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;

    .image-info {
      width: 100%;
    }

    .image-actions {
      align-self: flex-end;
    }
  }
}
</style>
