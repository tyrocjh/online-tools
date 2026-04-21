import { defineStore } from 'pinia'

// 支持的语言列表
export const languages = [
  { name: '中文', value: 'zh-CN' },
  { name: 'English', value: 'en-US' },
  { name: '日本語', value: 'ja-JP' }
]

export const useI18nStore = defineStore('i18n', {
  state: () => ({
    currentLanguage: 'zh-CN' // 默认语言
  }),
  
  actions: {
    setLanguage(lang: string) {
      this.currentLanguage = lang
      localStorage.setItem('language', lang)
      this.applyLanguage()
    },
    
    applyLanguage() {
      // 更新HTML的lang属性
      document.documentElement.lang = this.currentLanguage
    },
    
    initLanguage() {
      // 从localStorage加载语言设置
      const savedLanguage = localStorage.getItem('language')
      if (savedLanguage) {
        this.currentLanguage = savedLanguage
      } else {
        // 检查浏览器语言设置
        const browserLang = navigator.language || navigator.userLanguage
        if (browserLang.startsWith('zh')) {
          this.currentLanguage = 'zh-CN'
        } else if (browserLang.startsWith('ja')) {
          this.currentLanguage = 'ja-JP'
        } else {
          this.currentLanguage = 'en-US'
        }
      }
      this.applyLanguage()
    }
  }
})