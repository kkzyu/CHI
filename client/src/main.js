import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useDataStore } from '@/stores/dataStore'

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)

const dataStore = useDataStore()
dataStore.fetchAllData().then(() => {
    app.mount('#app')
})
