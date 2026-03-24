import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles/element-overrides.css'
import App from './App.vue'
import router from './router'
import './assets/styles/global.css'
import './utils/echarts-theme'
import { pinia } from './store/pinia'

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
