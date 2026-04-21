import { ref } from 'vue'

export interface DownloadItem {
  url: string
  name: string
}

export function useDownload() {
  const isDownloading = ref(false)

  // 下载单个文件
  const download = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 批量下载
  const downloadBatch = async (items: DownloadItem[], delay: number = 100) => {
    isDownloading.value = true

    try {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        setTimeout(() => {
          download(item.url, item.name)
        }, i * delay)
      }

      // 等待所有下载完成
      await new Promise(resolve => setTimeout(resolve, items.length * delay))
    } finally {
      isDownloading.value = false
    }
  }

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return {
    isDownloading,
    download,
    downloadBatch,
    formatFileSize
  }
}
