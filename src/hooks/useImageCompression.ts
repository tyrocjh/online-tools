import { ref, computed } from 'vue'

export interface CompressedImage {
  id: string
  name: string
  originalSize: number
  compressedSize: number
  originalUrl: string
  compressedUrl: string
  savingsPercentage: number
  quality: number
}

export interface UseImageCompressionOptions {
  defaultQuality?: number
  minQuality?: number
  maxQuality?: number
}

export function useImageCompression(options: UseImageCompressionOptions = {}) {
  const {
    defaultQuality = 80,
    minQuality = 10,
    maxQuality = 100
  } = options

  const quality = ref(defaultQuality)
  const compressedImages = ref<CompressedImage[]>([])
  const isCompressing = ref(false)

  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substring(2, 9)

  // 压缩单张图片
  const compressImage = async (
    file: File,
    compressQuality: number = quality.value
  ): Promise<CompressedImage | null> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      img.onload = () => {
        try {
          // 设置 canvas 尺寸
          canvas.width = img.width
          canvas.height = img.height

          // 绘制图片
          ctx?.drawImage(img, 0, 0)

          // 转换为 blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('压缩失败'))
                return
              }

              const originalUrl = URL.createObjectURL(file)
              const compressedUrl = URL.createObjectURL(blob)

              const originalSize = file.size
              const compressedSize = blob.size
              const savingsPercentage = ((originalSize - compressedSize) / originalSize) * 100

              resolve({
                id: generateId(),
                name: file.name,
                originalSize,
                compressedSize,
                originalUrl,
                compressedUrl,
                savingsPercentage,
                quality: compressQuality
              })
            },
            file.type,
            compressQuality / 100
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }

      img.src = URL.createObjectURL(file)
    })
  }

  // 批量压缩图片
  const compressImages = async (files: File[]): Promise<CompressedImage[]> => {
    isCompressing.value = true
    const results: CompressedImage[] = []

    try {
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(file)
          if (compressed) {
            compressedImages.value.push(compressed)
            results.push(compressed)
          }
        }
      }
    } finally {
      isCompressing.value = false
    }

    return results
  }

  // 重新压缩所有图片（当质量改变时）
  const recompressAll = async (newQuality: number) => {
    quality.value = newQuality
    isCompressing.value = true

    try {
      const updatedImages = await Promise.all(
        compressedImages.value.map(async (image) => {
          // 从原始 URL 获取文件
          const response = await fetch(image.originalUrl)
          const blob = await response.blob()
          const file = new File([blob], image.name, { type: blob.type })

          // 重新压缩
          const compressed = await compressImage(file, newQuality)
          if (compressed) {
            // 释放旧的压缩图片 URL
            URL.revokeObjectURL(image.compressedUrl)
            return compressed
          }
          return image
        })
      )

      compressedImages.value = updatedImages
    } finally {
      isCompressing.value = false
    }
  }

  // 移除单张图片
  const removeImage = (id: string) => {
    const index = compressedImages.value.findIndex(img => img.id === id)
    if (index > -1) {
      const image = compressedImages.value[index]
      URL.revokeObjectURL(image.originalUrl)
      URL.revokeObjectURL(image.compressedUrl)
      compressedImages.value.splice(index, 1)
    }
  }

  // 清空所有图片
  const clearImages = () => {
    compressedImages.value.forEach(image => {
      URL.revokeObjectURL(image.originalUrl)
      URL.revokeObjectURL(image.compressedUrl)
    })
    compressedImages.value = []
  }

  // 设置压缩质量
  const setQuality = (newQuality: number) => {
    quality.value = Math.max(minQuality, Math.min(maxQuality, newQuality))
  }

  // 计算属性
  const originalTotalSize = computed(() =>
    compressedImages.value.reduce((sum, img) => sum + img.originalSize, 0)
  )

  const compressedTotalSize = computed(() =>
    compressedImages.value.reduce((sum, img) => sum + img.compressedSize, 0)
  )

  const totalSavingsPercentage = computed(() => {
    if (originalTotalSize.value === 0) return 0
    return ((originalTotalSize.value - compressedTotalSize.value) / originalTotalSize.value) * 100
  })

  const imageCount = computed(() => compressedImages.value.length)
  const isEmpty = computed(() => compressedImages.value.length === 0)

  return {
    quality,
    compressedImages,
    isCompressing,
    originalTotalSize,
    compressedTotalSize,
    totalSavingsPercentage,
    imageCount,
    isEmpty,
    compressImage,
    compressImages,
    recompressAll,
    removeImage,
    clearImages,
    setQuality
  }
}
