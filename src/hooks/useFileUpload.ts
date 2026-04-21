import { ref, computed } from 'vue'

export interface UploadFile {
  id: string
  name: string
  size: number
  type: string
  file: File
  url: string
}

export interface UseFileUploadOptions {
  accept?: string
  maxSize?: number // 单位：MB
  maxCount?: number
  multiple?: boolean
}

export function useFileUpload(options: UseFileUploadOptions = {}) {
  const { accept = '*', maxSize = 20, maxCount = 10, multiple = true } = options

  const files = ref<UploadFile[]>([])
  const isDragging = ref(false)

  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substring(2, 9)

  // 验证文件
  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // 检查文件类型
    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(t => t.trim())
      const isAccepted = acceptedTypes.some(type => {
        if (type.includes('*')) {
          return file.type.startsWith(type.replace('/*', ''))
        }
        return file.type === type
      })
      if (!isAccepted) {
        return { valid: false, error: `不支持的文件类型: ${file.type}` }
      }
    }

    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      return { valid: false, error: `文件大小超过限制: ${maxSize}MB` }
    }

    return { valid: true }
  }

  // 处理文件
  const processFile = (file: File): UploadFile | null => {
    const validation = validateFile(file)
    if (!validation.valid) {
      console.warn(validation.error)
      return null
    }

    return {
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      url: URL.createObjectURL(file)
    }
  }

  // 添加文件
  const addFiles = (newFiles: FileList | null): UploadFile[] => {
    if (!newFiles) return []

    const fileArray = Array.from(newFiles)
    const addedFiles: UploadFile[] = []

    // 检查数量限制
    if (files.value.length + fileArray.length > maxCount) {
      console.warn(`最多只能上传 ${maxCount} 个文件`)
      return []
    }

    fileArray.forEach(file => {
      const uploadFile = processFile(file)
      if (uploadFile) {
        files.value.push(uploadFile)
        addedFiles.push(uploadFile)
      }
    })

    return addedFiles
  }

  // 移除文件
  const removeFile = (id: string) => {
    const index = files.value.findIndex(f => f.id === id)
    if (index > -1) {
      const file = files.value[index]
      URL.revokeObjectURL(file.url)
      files.value.splice(index, 1)
    }
  }

  // 清空所有文件
  const clearFiles = () => {
    files.value.forEach(file => {
      URL.revokeObjectURL(file.url)
    })
    files.value = []
  }

  // 设置拖拽状态
  const setDragging = (dragging: boolean) => {
    isDragging.value = dragging
  }

  // 计算属性
  const fileCount = computed(() => files.value.length)
  const totalSize = computed(() => files.value.reduce((sum, f) => sum + f.size, 0))
  const isEmpty = computed(() => files.value.length === 0)

  return {
    files,
    isDragging,
    fileCount,
    totalSize,
    isEmpty,
    addFiles,
    removeFile,
    clearFiles,
    setDragging
  }
}
