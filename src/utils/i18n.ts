import { messages } from '@/i18n'
import { useI18nStore } from '@/stores/i18n'
import { computed } from 'vue'

/**
 * 翻译函数
 * @param key 翻译键
 * @param defaultValue 默认值
 * @returns 翻译后的文本
 */
export function useTranslation() {
  const i18nStore = useI18nStore()
  
  const t = computed(() => {
    return (key: string, defaultValue: string = key): string => {
      const lang = i18nStore.currentLanguage
      
      // 解析key，支持嵌套路径，如 'nav.home'
      const keys = key.split('.')
      let value: any = messages[lang]
      
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k]
        } else {
          return defaultValue
        }
      }
      
      return typeof value === 'string' ? value : defaultValue
    }
  })
  
  return { t: t.value }
}

/**
 * 翻译函数（直接使用）
 * @param key 翻译键
 * @param defaultValue 默认值
 * @returns 翻译后的文本
 */
export function t(key: string, defaultValue: string = key): string {
  const i18nStore = useI18nStore()
  const lang = i18nStore.currentLanguage
  
  // 解析key，支持嵌套路径，如 'nav.home'
  const keys = key.split('.')
  let value: any = messages[lang]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return defaultValue
    }
  }
  
  return typeof value === 'string' ? value : defaultValue
}

/**
 * 获取当前语言
 * @returns 当前语言代码
 */
export function getCurrentLanguage(): string {
  const i18nStore = useI18nStore()
  return i18nStore.currentLanguage
}

/**
 * 切换语言
 * @param lang 语言代码
 */
export function changeLanguage(lang: string): void {
  const i18nStore = useI18nStore()
  i18nStore.setLanguage(lang)
}
