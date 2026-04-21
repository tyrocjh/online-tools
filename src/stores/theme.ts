import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    isDark: false
  }),
  
  actions: {
    toggleTheme() {
      this.isDark = !this.isDark
      localStorage.setItem('isDark', this.isDark.toString())
      this.applyTheme()
    },
    
    applyTheme() {
      if (this.isDark) {
        document.documentElement.classList.add('dark-theme')
      } else {
        document.documentElement.classList.remove('dark-theme')
      }
    },
    
    initTheme() {
      // 从localStorage加载主题设置
      const savedTheme = localStorage.getItem('isDark')
      if (savedTheme !== null) {
        this.isDark = savedTheme === 'true'
      } else {
        // 检查系统偏好
        this.isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      this.applyTheme()
    }
  }
})