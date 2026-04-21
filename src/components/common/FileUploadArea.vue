<template>
  <div
    class="file-upload-area"
    :class="{ dragging: isDragging }"
    @drop="handleDrop"
    @dragover.prevent="handleDragOver"
    @dragleave.prevent="handleDragLeave"
    @click="triggerFileInput"
  >
    <div class="upload-content">
      <slot name="icon">
        <ImageIcon class="upload-icon" />
      </slot>
      <slot name="text">
        <p class="upload-text">{{ text }}</p>
      </slot>
      <slot name="subtext">
        <p class="upload-subtext">{{ subtext }}</p>
      </slot>
    </div>
    <input
      type="file"
      ref="fileInput"
      :multiple="multiple"
      :accept="accept"
      @change="handleFileChange"
      style="display: none"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Image as ImageIcon } from 'lucide-vue-next'

interface Props {
  text?: string
  subtext?: string
  accept?: string
  multiple?: boolean
  isDragging?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: '拖拽文件到此处，或点击选择文件',
  subtext: '',
  accept: '*',
  multiple: true,
  isDragging: false
})

const emit = defineEmits<{
  (e: 'select', files: FileList): void
  (e: 'dragover'): void
  (e: 'dragleave'): void
}>()

const fileInput = ref<HTMLInputElement>()

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    emit('select', target.files)
    // 清空 input 值，允许重复选择相同文件
    target.value = ''
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  emit('dragleave')
  if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
    emit('select', event.dataTransfer.files)
  }
}

const handleDragOver = () => {
  emit('dragover')
}

const handleDragLeave = () => {
  emit('dragleave')
}
</script>

<style scoped lang="scss">
.file-upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 12px;
  padding: 60px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover,
  &.dragging {
    border-color: var(--primary-color);
    background-color: rgba(0, 123, 255, 0.05);
  }

  .upload-content {
    .upload-icon {
      width: 48px;
      height: 48px;
      color: var(--text-secondary);
      margin-bottom: 16px;
    }

    .upload-text {
      font-size: 16px;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .upload-subtext {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }
}
</style>
