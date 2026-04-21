import { defineStore } from 'pinia'

// 主题色列表
export const themeColors = [
  { name: '默认蓝', value: '#007bff' },
  { name: '红色', value: '#dc3545' },
  { name: '绿色', value: '#28a745' },
  { name: '黄色', value: '#ffc107' },
  { name: '紫色', value: '#6f42c1' },
  { name: '粉色', value: '#e83e8c' },
  { name: '橙色', value: '#fd7e14' },
  { name: '青色', value: '#17a2b8' },
  { name: '靛蓝', value: '#177cb0' },
  { name: '深绿', value: '#20c997' }
]

export const useThemeColorStore = defineStore('themeColor', {
  state: () => ({
    currentColor: '#007bff' // 默认主题色
  }),
  
  actions: {
    setThemeColor(color: string) {
      this.currentColor = color
      localStorage.setItem('themeColor', color)
      this.applyThemeColor()
    },
    
    applyThemeColor() {
      document.documentElement.style.setProperty('--primary-color', this.currentColor)
      // 计算悬停颜色（稍深）
      const hoverColor = this.darkenColor(this.currentColor, 0.1)
      document.documentElement.style.setProperty('--primary-hover', hoverColor)
    },
    
    initThemeColor() {
      // 从localStorage加载主题色设置
      const savedColor = localStorage.getItem('themeColor')
      if (savedColor) {
        this.currentColor = savedColor
      }
      this.applyThemeColor()
    },
    
    // 辅助函数：将颜色调暗
    darkenColor(color: string, amount: number): string {
      const hex = color.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      
      const newR = Math.max(0, Math.floor(r * (1 - amount)))
      const newG = Math.max(0, Math.floor(g * (1 - amount)))
      const newB = Math.max(0, Math.floor(b * (1 - amount)))
      
      return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
    }
  }
})