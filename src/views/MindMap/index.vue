<template>
  <ToolPageLayout
    :title="t('mindMap.title')"
    :description="t('mindMap.description')"
  >
    <div class="mind-map">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="toolbar-left">
          <ActionButton
            primary
            :icon="Plus"
            :text="t('mindMap.addChild')"
            @click="addChildNode"
          />
          <ActionButton
            :icon="Undo"
            :text="t('mindMap.undo')"
            @click="undo"
            :disabled="historyIndex <= 0"
          />
          <ActionButton
            :icon="Redo"
            :text="t('mindMap.redo')"
            @click="redo"
            :disabled="historyIndex >= history.length - 1"
          />
          <ActionButton
            :icon="Trash2"
            :text="t('mindMap.delete')"
            @click="deleteNode"
            :disabled="!selectedNode"
          />
          <ActionButton
            :icon="LayoutGrid"
            :text="t('mindMap.autoLayout')"
            @click="autoLayout"
          />
        </div>
        <div class="toolbar-right">
          <ActionButton
            :icon="ZoomIn"
            :title="t('mindMap.zoomIn')"
            @click="zoomIn"
          />
          <ActionButton
            :icon="ZoomOut"
            :title="t('mindMap.zoomOut')"
            @click="zoomOut"
          />
          <ActionButton
            :icon="RefreshCw"
            :text="t('mindMap.resetView')"
            @click="resetView"
          />
          <ActionButton
            :icon="Download"
            :text="t('mindMap.exportPNG')"
            @click="exportPNG"
          />
        </div>
      </div>

      <!-- 画布容器 -->
      <div
        class="canvas-container"
        ref="canvasContainer"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
        @wheel="handleWheel"
        @dblclick="handleDoubleClick"
      >
        <canvas
          ref="canvas"
          :width="canvasWidth"
          :height="canvasHeight"
        ></canvas>
        <!-- 节点编辑输入框 -->
        <div
          v-if="editingNode"
          class="node-editor"
          :style="{
            left: offsetX + editingNode.x * scale + 'px',
            top: offsetY + editingNode.y * scale + 'px',
            width: editingNode.width * scale + 'px',
          }"
        >
          <input
            v-model="editingText"
            class="node-input"
            @blur="finishEditing"
            @keydown.enter="finishEditing"
            @keydown.esc="cancelEditing"
            ref="nodeInput"
          />
        </div>
      </div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useTranslation } from "@/utils/i18n";
import ActionButton from "@/components/common/ActionButton.vue";
import {
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Download,
  Plus,
  Undo,
  Redo,
  Trash2,
  LayoutGrid,
} from "lucide-vue-next";

const { t } = useTranslation();

// 画布相关
const canvas = ref<HTMLCanvasElement | null>(null);
const canvasContainer = ref<HTMLElement | null>(null);
const canvasWidth = ref(912);
const canvasHeight = ref(600);
const ctx = ref<CanvasRenderingContext2D | null>(null);

// 节点数据
interface Node {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  children: Node[];
  parent: Node | null;
  level: number;
  color: string;
}

const rootNode = ref<Node>({
  id: "root",
  text: t("mindMap.centerTopic"),
  x: canvasWidth.value / 2 - 60,
  y: canvasHeight.value / 2 - 20,
  width: 120,
  height: 40,
  children: [],
  parent: null,
  level: 0,
  color: "#2196F3",
});

// 深拷贝节点，避免循环引用
const cloneNode = (node: Node): Node => {
  const cloned: Node = {
    id: node.id,
    text: node.text,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    children: [],
    parent: null,
    level: node.level,
    color: node.color,
  };

  node.children.forEach((child) => {
    const clonedChild = cloneNode(child);
    clonedChild.parent = cloned;
    cloned.children.push(clonedChild);
  });

  return cloned;
};

// 设置父节点引用
const setParentReferences = (node: Node) => {
  node.children.forEach((child) => {
    child.parent = node;
    setParentReferences(child);
  });
};

setParentReferences(rootNode.value);

// 选择和编辑
const selectedNode = ref<Node | null>(null);
const editingNode = ref<Node | null>(null);
const editingText = ref("");
const nodeInput = ref<HTMLInputElement | null>(null);

// 历史记录
const history = ref<Node[]>([]);
const historyIndex = ref(-1);

// 保存历史记录
const saveHistory = () => {
  // 移除当前索引之后的历史记录
  history.value = history.value.slice(0, historyIndex.value + 1);
  // 添加新的历史记录
  history.value.push(cloneNode(rootNode.value));
  // 更新历史索引
  historyIndex.value = history.value.length - 1;
  console.log(
    "Save history:",
    history.value.length,
    "index:",
    historyIndex.value,
  );
};

// 初始化历史记录
saveHistory();

// 视图控制
const scale = ref(1);
const offsetX = ref(0);
const offsetY = ref(0);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragOffsetX = ref(0);
const dragOffsetY = ref(0);

// 节点拖拽
const isDraggingNode = ref(false);
const draggedNode = ref<Node | null>(null);
const nodeDragStartX = ref(0);
const nodeDragStartY = ref(0);

// 颜色数组
const colors = ["#4CAF50", "#2196F3", "#FF9800", "#E91E63", "#9C27B0"];

// 初始化画布
onMounted(() => {
  if (canvas.value) {
    ctx.value = canvas.value.getContext("2d");
    render();
  }
});

// 绘制所有连线
const drawConnections = (node: Node) => {
  if (!ctx.value) return;

  // 绘制当前节点与子节点的连线
  node.children.forEach((child) => {
    ctx.value!.beginPath();
    ctx.value!.moveTo(node.x + node.width / 2, node.y + node.height / 2);

    // 计算节点中心位置
    const nodeCenterX = node.x + node.width / 2;
    const nodeCenterY = node.y + node.height / 2;
    const childCenterX = child.x + child.width / 2;
    const childCenterY = child.y + child.height / 2;

    // 计算节点和子节点的相对位置
    const dx = childCenterX - nodeCenterX;
    const dy = childCenterY - nodeCenterY;

    // 计算距离和角度
    const distance = Math.sqrt(dx * dx + dy * dy);

    // 计算贝塞尔曲线控制点，使曲线更加自然
    // 控制点距离节点中心的距离为总距离的1/3
    const controlDistance = distance / 3;

    // 计算控制点的方向，与连接线方向一致
    const angle = Math.atan2(dy, dx);

    // 为两个节点分别计算控制点
    const nodeControlX = nodeCenterX + Math.cos(angle) * controlDistance;
    const nodeControlY = nodeCenterY + Math.sin(angle) * controlDistance;

    const childControlX = childCenterX - Math.cos(angle) * controlDistance;
    const childControlY = childCenterY - Math.sin(angle) * controlDistance;

    // 使用三次贝塞尔曲线绘制连接线，这样曲线更加平滑自然
    ctx.value!.bezierCurveTo(
      nodeControlX,
      nodeControlY,
      childControlX,
      childControlY,
      childCenterX,
      childCenterY,
    );

    ctx.value!.strokeStyle = child.color;
    ctx.value!.lineWidth = 2;
    ctx.value!.stroke();
    // 递归绘制子节点的连线
    drawConnections(child);
  });
};

// 渲染思维导图
const render = () => {
  console.log("Render called");
  console.log("Canvas exists:", !!canvas.value);
  console.log("Context exists:", !!ctx.value);
  if (!ctx.value || !canvas.value) {
    console.log("Canvas or context not available");
    return;
  }

  // 清空画布
  ctx.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value);
  console.log("Canvas cleared");

  // 应用缩放和偏移
  ctx.value.save();
  ctx.value.translate(offsetX.value, offsetY.value);
  ctx.value.scale(scale.value, scale.value);
  console.log(
    "Applied transformations: scale=",
    scale.value,
    "offsetX=",
    offsetX.value,
    "offsetY=",
    offsetY.value,
  );

  // 先绘制所有连线
  drawConnections(rootNode.value);
  console.log("Drew connections");
  // 再绘制所有节点（层级高于连线）
  drawNode(rootNode.value);
  console.log("Drew nodes");

  ctx.value.restore();
  console.log("Render completed");
};

// 绘制单个节点
const drawNode = (node: Node) => {
  if (!ctx.value) return;

  // 绘制圆角矩形的函数
  const drawRoundedRect = (
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    fillStyle: string,
    strokeStyle?: string,
    lineWidth?: number,
  ) => {
    ctx.value!.beginPath();
    ctx.value!.moveTo(x + radius, y);
    ctx.value!.lineTo(x + width - radius, y);
    ctx.value!.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.value!.lineTo(x + width, y + height - radius);
    ctx.value!.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height,
    );
    ctx.value!.lineTo(x + radius, y + height);
    ctx.value!.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.value!.lineTo(x, y + radius);
    ctx.value!.quadraticCurveTo(x, y, x + radius, y);
    ctx.value!.closePath();

    if (fillStyle) {
      ctx.value!.fillStyle = fillStyle;
      ctx.value!.fill();
    }

    if (strokeStyle && lineWidth) {
      ctx.value!.strokeStyle = strokeStyle;
      ctx.value!.lineWidth = lineWidth;
      ctx.value!.stroke();
    }
  };

  // 绘制节点
  if (node.id === "root") {
    // 根节点：使用当前颜色背景
    drawRoundedRect(node.x, node.y, node.width, node.height, 8, node.color);
  } else {
    // 非根节点
    if (selectedNode.value && selectedNode.value.id === node.id) {
      // 选中状态：使用当前颜色背景
      drawRoundedRect(node.x, node.y, node.width, node.height, 8, node.color);
      // 选中边框
      drawRoundedRect(
        node.x - 2,
        node.y - 2,
        node.width + 4,
        node.height + 4,
        10,
        "",
        node.color,
        3,
      );
    } else {
      // 未选中状态：白色背景 + 当前颜色边框
      drawRoundedRect(
        node.x,
        node.y,
        node.width,
        node.height,
        8,
        "white",
        node.color,
        2,
      );
    }
  }

  // 绘制节点文本
  if (
    node.id === "root" ||
    (selectedNode.value && selectedNode.value.id === node.id)
  ) {
    // 根节点或选中状态：白色文本
    ctx.value.fillStyle = "white";
  } else {
    // 非根节点未选中状态：黑色文本
    ctx.value.fillStyle = "black";
  }
  ctx.value.font = "14px Arial";
  ctx.value.textAlign = "center";
  ctx.value.textBaseline = "middle";
  ctx.value.fillText(
    node.text,
    node.x + node.width / 2,
    node.y + node.height / 2,
  );

  // 绘制子节点
  node.children.forEach((child) => drawNode(child));
};

// 添加子节点
const addChildNode = () => {
  const targetNode = selectedNode.value || rootNode.value;

  // 计算新节点的位置，基于已有子节点的数量
  const childCount = targetNode.children.length;
  const offsetY = childCount * 40; // 每个子节点垂直偏移40像素
  const startY = targetNode.y - childCount * 20; // 从目标节点上方开始排列

  const newNode: Node = {
    id: Date.now().toString(),
    text: t("mindMap.newNode"),
    x: targetNode.x + 150,
    y: startY + offsetY,
    width: 100,
    height: 30,
    children: [],
    parent: targetNode,
    level: targetNode.level + 1,
    color: colors[targetNode.level % colors.length],
  };

  targetNode.children.push(newNode);
  selectedNode.value = newNode;
  saveHistory();
  render();
};

// 撤销
const undo = () => {
  console.log("Undo called");
  console.log("Current historyIndex:", historyIndex.value);
  console.log("History length:", history.value.length);
  console.log("Condition:", historyIndex.value > 0);

  if (historyIndex.value > 0) {
    historyIndex.value--;
    console.log("New historyIndex:", historyIndex.value);
    rootNode.value = cloneNode(history.value[historyIndex.value]);
    selectedNode.value = null;
    render();
    console.log("Undo completed");
  }
};

// 恢复
const redo = () => {
  console.log("Redo called");
  console.log("Current historyIndex:", historyIndex.value);
  console.log("History length:", history.value.length);
  console.log("Condition:", historyIndex.value < history.length - 1);
  console.log("Canvas exists:", !!canvas.value);
  console.log("Context exists:", !!ctx.value);

  if (historyIndex.value < history.length - 1) {
    historyIndex.value++;
    console.log("New historyIndex:", historyIndex.value);
    console.log("History item:", history.value[historyIndex.value]);
    rootNode.value = cloneNode(history.value[historyIndex.value]);
    console.log("Root node after update:", rootNode.value);
    selectedNode.value = null;
    render();
    console.log("Redo completed");
  }
};

// 删除节点
const deleteNode = () => {
  if (selectedNode.value && selectedNode.value.parent) {
    const parent = selectedNode.value.parent;
    const index = parent.children.findIndex(
      (child) => child.id === selectedNode.value?.id,
    );
    if (index > -1) {
      parent.children.splice(index, 1);
      selectedNode.value = parent;
      saveHistory();
      render();
    }
  }
};

// 自动布局
const autoLayout = () => {
  // 简单的分层布局算法
  const layoutNode = (node: Node, x: number, y: number, levelWidth: number) => {
    node.x = x;
    node.y = y;

    if (node.children.length > 0) {
      const childYSpacing = 80;
      const totalHeight = (node.children.length - 1) * childYSpacing;
      const startY = y - totalHeight / 2;

      node.children.forEach((child, index) => {
        layoutNode(
          child,
          x + levelWidth,
          startY + index * childYSpacing,
          levelWidth,
        );
      });
    }
  };

  layoutNode(rootNode.value, 200, canvasHeight.value / 2, 200);
  saveHistory();
  render();
};

// 放大
const zoomIn = () => {
  scale.value *= 1.2;
  render();
};

// 缩小
const zoomOut = () => {
  scale.value /= 1.2;
  render();
};

// 重置视图
const resetView = () => {
  scale.value = 1;
  offsetX.value = 0;
  offsetY.value = 0;
  render();
};

// 导出PNG
const exportPNG = () => {
  if (!canvas.value) return;

  try {
    const dataURL = canvas.value.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "mind-map.png";
    link.click();
  } catch (error) {
    console.error("Failed to export PNG:", error);
  }
};

// 鼠标事件处理
const handleMouseDown = (e: MouseEvent) => {
  if (!canvasContainer.value) return;

  const rect = canvasContainer.value.getBoundingClientRect();
  const x = (e.clientX - rect.left - offsetX.value) / scale.value;
  const y = (e.clientY - rect.top - offsetY.value) / scale.value;

  // 检查是否点击了节点
  const clickedNode = findNodeAt(x, y, rootNode.value);
  if (clickedNode) {
    selectedNode.value = clickedNode;
    // 开始节点拖拽
    isDraggingNode.value = true;
    draggedNode.value = clickedNode;
    nodeDragStartX.value = e.clientX;
    nodeDragStartY.value = e.clientY;
    render();
  } else {
    // 开始拖动画布
    isDragging.value = true;
    dragStartX.value = e.clientX;
    dragStartY.value = e.clientY;
    dragOffsetX.value = offsetX.value;
    dragOffsetY.value = offsetY.value;
  }
};

const handleMouseMove = (e: MouseEvent) => {
  if (isDragging.value) {
    // 拖动画布
    offsetX.value = dragOffsetX.value + (e.clientX - dragStartX.value);
    offsetY.value = dragOffsetY.value + (e.clientY - dragStartY.value);
    render();
  } else if (isDraggingNode.value && draggedNode.value) {
    // 拖动节点
    const dx = (e.clientX - nodeDragStartX.value) / scale.value;
    const dy = (e.clientY - nodeDragStartY.value) / scale.value;
    draggedNode.value.x += dx;
    draggedNode.value.y += dy;
    nodeDragStartX.value = e.clientX;
    nodeDragStartY.value = e.clientY;
    render();
  }
};

const handleMouseUp = () => {
  if (isDraggingNode.value && draggedNode.value) {
    // 节点拖拽结束，保存历史记录
    saveHistory();
  }
  isDragging.value = false;
  isDraggingNode.value = false;
  draggedNode.value = null;
};

const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  const delta = e.deltaY > 0 ? 0.9 : 1.1;

  // 计算画布中心点
  const centerX = canvasWidth.value / 2;
  const centerY = canvasHeight.value / 2;

  // 调整偏移量，使缩放围绕画布中心进行
  offsetX.value = centerX - (centerX - offsetX.value) * delta;
  offsetY.value = centerY - (centerY - offsetY.value) * delta;

  scale.value = Math.max(0.1, Math.min(5, scale.value * delta));
  render();
};

// 查找指定位置的节点
const findNodeAt = (x: number, y: number, node: Node): Node | null => {
  if (
    x >= node.x &&
    x <= node.x + node.width &&
    y >= node.y &&
    y <= node.y + node.height
  ) {
    return node;
  }

  for (const child of node.children) {
    const found = findNodeAt(x, y, child);
    if (found) {
      return found;
    }
  }

  return null;
};

// 双击编辑节点
const handleDoubleClick = (e: MouseEvent) => {
  if (!canvasContainer.value) return;

  const rect = canvasContainer.value.getBoundingClientRect();
  const x = (e.clientX - rect.left - offsetX.value) / scale.value;
  const y = (e.clientY - rect.top - offsetY.value) / scale.value;

  const clickedNode = findNodeAt(x, y, rootNode.value);
  if (clickedNode) {
    startEditing(clickedNode);
  }
};

// 开始编辑节点
const startEditing = (node: Node) => {
  editingNode.value = node;
  editingText.value = node.text;

  // 等待DOM更新后聚焦输入框
  setTimeout(() => {
    if (nodeInput.value) {
      nodeInput.value.focus();
      nodeInput.value.select();
    }
  }, 0);
};

// 完成编辑
const finishEditing = () => {
  if (editingNode.value) {
    editingNode.value.text = editingText.value;
    saveHistory();
    render();
  }
  editingNode.value = null;
};

// 取消编辑
const cancelEditing = () => {
  editingNode.value = null;
};

// 监听节点变化
watch(
  rootNode,
  () => {
    render();
  },
  { deep: true },
);
</script>

<style scoped lang="scss">
.mind-map {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 12px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    .toolbar-left {
      display: flex;
      gap: 8px;
    }

    .toolbar-right {
      display: flex;
      gap: 8px;
    }
  }

  .canvas-container {
    position: relative;
    width: 100%;
    height: 600px;
    border: 1px solid var(--border-light-color);
    border-radius: 12px;
    overflow: hidden;
    background-color: white;
    cursor: grab;

    &:active {
      cursor: grabbing;
    }

    canvas {
      display: block;
    }

    .node-editor {
      position: absolute;
      z-index: 10;
      transform: translate(-50%, -50%);

      .node-input {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--primary-color);
        border-radius: 4px;
        font-size: 14px;
        background-color: white;
      }
    }
  }

  .hint {
    margin-top: 16px;
    font-size: 14px;
    color: var(--text-secondary);
    text-align: center;
  }
}

@media (max-width: 768px) {
  .mind-map {
    padding: 16px;

    .toolbar {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;

      .toolbar-right {
        justify-content: center;
      }
    }

    .canvas-container {
      height: 400px;
    }
  }
}
</style>
