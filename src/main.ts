import Vue from 'vue'
import App from './renderer/App.vue'
import router from './renderer/router'
import ElementUI from 'element-ui'
import { webFrame } from 'electron'
import 'element-ui/lib/theme-chalk/index.css'
import VueLazyLoad from 'vue-lazyload'
import axios from 'axios'
import mainMixin from './renderer/utils/mainMixin'
import bus from '@/utils/bus'
import db from './renderer/utils/db'

webFrame.setVisualZoomLevelLimits(1, 1)

Vue.config.productionTip = false
Vue.prototype.$$db = db
Vue.prototype.$http = axios
Vue.prototype.$bus = bus

Vue.use(ElementUI)
Vue.use(VueLazyLoad)
Vue.mixin(mainMixin)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
