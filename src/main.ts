import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 导入全局样式
import './styles/global.scss'
// 导入组件样式
import './styles/components.scss'

// 导入公共组件
import commonComponents from './components/common/index.ts'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.use(commonComponents)

app.mount('#app')

// 初始化主题
import { useThemeStore } from './stores/theme'
const themeStore = useThemeStore()
themeStore.initTheme()

// 初始化主题色
import { useThemeColorStore } from './stores/themeColor'
const themeColorStore = useThemeColorStore()
themeColorStore.initThemeColor()

// 初始化国际化
import { useI18nStore } from './stores/i18n'
const i18nStore = useI18nStore()
i18nStore.initLanguage()