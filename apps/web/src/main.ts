import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { roteador } from './rotas'

// Puxando o tema Roça Neon que fizemos no pacote ui
import { pluginAssineAi } from '@assineai/ui'

const aplicativo = createApp(App)

aplicativo.use(createPinia())
aplicativo.use(roteador)
aplicativo.use(pluginAssineAi)

aplicativo.mount('#app')
