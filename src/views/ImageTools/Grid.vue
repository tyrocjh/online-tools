<template>
  <ToolPageLayout
    :title="t('imageTools.grid.title')"
    :description="t('imageTools.grid.description')"
  >
    <!-- 上传区域 -->
    <FileUploadArea
      v-if="!imageUrl"
      :text="t('imageTools.uploadText')"
      :subtext="t('imageTools.grid.uploadSubtext')"
      accept="image/png,image/jpeg,image/webp"
      :is-dragging="isDragging"
      @select="handleFileSelect"
      @dragover="setDragging(true)"
      @dragleave="setDragging(false)"
    />

    <!-- 网格设置 -->
    <div class="grid-settings" v-if="imageUrl">
      <div class="settings-row">
        <InputGroup :label="t('imageTools.grid.grid')" inline>
          <div class="grid-buttons">
            <ActionButton
              v-for="size in gridSizes"
              :key="size"
              :text="size + '×' + size"
              :primary="gridSize === size"
              @click="setGridSize(size)"
            />
          </div>
        </InputGroup>
        <InputGroup
          :label="t('imageTools.grid.spacing') + ': ' + spacing + 'px'"
          inline
        >
          <input
            type="range"
            class="range-input"
            v-model.number="spacing"
            min="1"
            max="20"
            step="1"
            @change="updateGrid"
          />
        </InputGroup>
        <div class="action-buttons">
          <ActionButton
            :text="t('imageTools.grid.reselect')"
            @click="reselectImage"
          />
          <ActionButton
            primary
            :text="t('imageTools.grid.downloadAll')"
            @click="downloadAll"
          />
        </div>
      </div>
    </div>

    <!-- 网格预览 -->
    <div class="grid-preview" v-if="imageUrl">
      <div class="grid-container" :style="gridContainerStyle">
        <div
          v-for="(cell, index) in gridSize * gridSize"
          :key="index"
          class="grid-cell"
          :style="gridCellStyle"
        >
          <canvas
            :ref="(el) => (cellRefs[index] = el)"
            class="grid-canvas"
          ></canvas>
        </div>
      </div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useTranslation } from "@/utils/i18n";
import { useDownload } from "@/hooks/useDownload";

const { t } = useTranslation();
const { downloadBatch } = useDownload();

// 拖拽状态
const isDragging = ref(false);

// 图片状态
const imageUrl = ref("");
const imageFile = ref<File | null>(null);

// 网格设置
const gridSize = ref(3);
const gridSizes = [2, 3, 4];
const spacing = ref(5);

// 画布引用
const cellRefs = ref<(HTMLCanvasElement | null)[]>([]);
const gridImages = ref<string[]>([]);
const canvasWidth = ref(150); // 默认宽度
const canvasHeight = ref(150); // 默认高度

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
    setDragging(false);
    // 延迟更新网格，确保图片加载完成
    setTimeout(updateGrid, 100);
  }
};

// 设置网格大小
const setGridSize = (size: number) => {
  // 先计算新的网格尺寸，然后再更新gridSize
  if (!imageUrl.value) {
    gridSize.value = size;
    cellRefs.value = [];
    return;
  }

  const img = new Image();
  img.src = imageUrl.value;
  img.onload = () => {
    const newGridSize = size;
    const cellCount = newGridSize * newGridSize;

    // 固定容器宽度，确保整体大小不变
    const fixedContainerWidth = 400; // 固定容器宽度

    // 计算每个canvas的宽度，考虑间距
    const availableWidth = fixedContainerWidth - spacing.value * newGridSize;
    const scaledWidth = availableWidth / newGridSize;

    // 保持图片比例
    const scale = scaledWidth / (img.width / newGridSize);
    const scaledHeight = (img.height / newGridSize) * scale;

    // 计算每个网格的原始大小
    const cellWidth = img.width / newGridSize;
    const cellHeight = img.height / newGridSize;

    // 先在内存中生成所有canvas
    const offscreenCanvases: HTMLCanvasElement[] = [];
    const newGridImages: string[] = [];

    for (let i = 0; i < cellCount; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // 计算每个网格的位置
        const row = Math.floor(i / newGridSize);
        const col = i % newGridSize;
        const x = col * cellWidth;
        const y = row * cellHeight;

        // 绘制图片到画布
        ctx.drawImage(
          img,
          x,
          y,
          cellWidth,
          cellHeight,
          0,
          0,
          scaledWidth,
          scaledHeight
        );

        // 保存图片数据
        const dataUrl = canvas.toDataURL("image/png");
        newGridImages.push(dataUrl);
        offscreenCanvases.push(canvas);
      }
    }

    // 一次性更新所有数据和DOM
    requestAnimationFrame(() => {
      // 更新网格大小
      gridSize.value = newGridSize;
      // 清空旧的canvas引用
      cellRefs.value = [];

      // 延迟一点时间，确保DOM更新完成
      setTimeout(() => {
        // 更新canvas尺寸引用
        canvasWidth.value = scaledWidth;
        canvasHeight.value = scaledHeight;

        // 更新网格图片数据
        gridImages.value = newGridImages;

        // 更新DOM中的canvas
        for (let i = 0; i < cellCount; i++) {
          const canvas = cellRefs.value[i];
          if (canvas) {
            // 设置画布尺寸
            canvas.width = scaledWidth;
            canvas.height = scaledHeight;

            // 复制离屏canvas的内容到DOM canvas
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(offscreenCanvases[i], 0, 0);
            }
          }
        }
      }, 50);
    });
  };
};

// 重新选择图片
const reselectImage = () => {
  imageUrl.value = "";
  imageFile.value = null;
  gridImages.value = [];
};

// 更新网格
const updateGrid = () => {
  if (!imageUrl.value) return

  const img = new Image();
  img.src = imageUrl.value;
  img.onload = () => {
    const cellCount = gridSize.value * gridSize.value;
    const newGridImages: string[] = [];

    // 固定容器宽度，确保整体大小不变
    const fixedContainerWidth = 400; // 固定容器宽度

    // 计算每个canvas的宽度，考虑间距
    const availableWidth = fixedContainerWidth - spacing.value * gridSize.value;
    const scaledWidth = availableWidth / gridSize.value;
    
    // 保持图片比例
    const scale = scaledWidth / (img.width / gridSize.value);
    const scaledHeight = (img.height / gridSize.value) * scale;

    // 计算每个网格的原始大小
    const cellWidth = img.width / gridSize.value;
    const cellHeight = img.height / gridSize.value;

    // 先在内存中生成所有canvas
    const offscreenCanvases: HTMLCanvasElement[] = [];
    for (let i = 0; i < cellCount; i++) {
      const canvas = document.createElement('canvas');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // 计算每个网格的位置
        const row = Math.floor(i / gridSize.value);
        const col = i % gridSize.value;
        const x = col * cellWidth;
        const y = row * cellHeight;

        // 绘制图片到画布
        ctx.drawImage(
          img,
          x,
          y,
          cellWidth,
          cellHeight,
          0,
          0,
          scaledWidth,
          scaledHeight
        );

        // 保存图片数据
        const dataUrl = canvas.toDataURL("image/png");
        newGridImages.push(dataUrl);
        offscreenCanvases.push(canvas);
      }
    }

    // 一次性更新所有canvas
    requestAnimationFrame(() => {
      // 更新canvas尺寸引用
      canvasWidth.value = scaledWidth;
      canvasHeight.value = scaledHeight;

      // 更新网格图片数据
      gridImages.value = newGridImages;

      // 更新DOM中的canvas
      for (let i = 0; i < cellCount; i++) {
        const canvas = cellRefs.value[i];
        if (canvas) {
          // 设置画布尺寸
          canvas.width = scaledWidth;
          canvas.height = scaledHeight;

          // 复制离屏canvas的内容到DOM canvas
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(offscreenCanvases[i], 0, 0);
          }
        }
      }
    });
  };
};

// 下载全部
const downloadAll = () => {
  if (gridImages.value.length === 0) return;

  const items = gridImages.value.map((url, index) => ({
    url,
    name: `grid_${gridSize.value}x${gridSize.value}_${index + 1}.png`,
  }));
  downloadBatch(items);
};

// 计算网格容器样式
const gridContainerStyle = computed(() => {
  // 固定容器宽度，确保整体大小不变
  const fixedContainerWidth = 400;

  return {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    width: `${fixedContainerWidth}px`,
    margin: "0 auto"
  };
});

// 计算网格单元格样式
const gridCellStyle = computed(() => {
  // 固定容器宽度，确保整体大小不变
  const fixedContainerWidth = 400;

  // 计算每个canvas的宽度，考虑间距
  const availableWidth = fixedContainerWidth - spacing.value * gridSize.value;
  const calculatedWidth = availableWidth / gridSize.value;

  // 计算单元格高度，保持与canvas高度一致
  // 这样可以确保在更新过程中尺寸保持稳定
  const calculatedHeight = canvasHeight.value || calculatedWidth;

  return {
    width: `${calculatedWidth}px`,
    height: `${calculatedHeight}px`,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    margin: `${spacing.value / 2}px`,
    boxSizing: "border-box"
  };
});

// 监听图片加载完成
watch(imageUrl, (newUrl) => {
  if (newUrl) {
    updateGrid();
  }
});
</script>

<style scoped lang="scss">
.grid-settings {
  margin: 24px 0 16px;
  padding: 16px;
  background-color: var(--bg-secondary);
  border-radius: 8px;

  .settings-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
  }

  .grid-buttons {
    width: 170px;
    display: flex;
    justify-content: space-between;
  }

  .spacing-control {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;

    label {
      font-size: 14px;
      color: var(--text-primary);
      white-space: nowrap;
    }

    input[type="range"] {
      flex: 1;
      max-width: 200px;
    }
  }

  .action-buttons {
    display: flex;
    gap: 8px;
  }
}

.grid-preview {
  margin: 24px 0;
  padding: 24px;
  background-color: var(--bg-secondary);
  border-radius: 8px;
  display: flex;
  justify-content: center;

  .grid-container {
    max-width: 90%;

    .grid-cell {
      overflow: hidden;

      .grid-canvas {
        max-width: 100%;
        max-height: 100%;
        border-radius: 6px;
      }
    }
  }
}

@media (max-width: 768px) {
  .grid-settings {
    .settings-row {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;

      .spacing-control {
        width: 100%;

        input[type="range"] {
          max-width: none;
        }
      }

      .action-buttons {
        width: 100%;
        justify-content: space-between;
      }
    }
  }
}
</style>