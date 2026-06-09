// import './assets/main.css'
import './assets/global.css'
import './assets/quill-fonts.css'
import pinia from './stores/index.js'
import { createApp } from 'vue'
// import { createPinia } from 'pinia'
// import cors from 'cors'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)
app.use(pinia)
app.mount('#app')
