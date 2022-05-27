import App from './App.vue'
import { CreateAppFunction } from 'vue'
import router from './router'

Vue.config.productionTip = false

new CreateAppFunction({
  render: (h) => h(App),
  router,
}).$mount('#app')
