import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  routes: [
    {
      path: '/main-page',
      name: 'main-page',
      component: () => import(/* webpackChunkName: "SettingPage" */ '@/layouts/Main.vue'),
      children: [
        {
          path: 'gallery',
          component: () => import(/* webpackChunkName: "Gallery" */ '@/pages/Gallery.vue'),
          name: 'gallery'
        },
        {
          path: 'setting',
          component: () => import(/* webpackChunkName: "setting" */ '@/pages/PicGoSetting.vue'),
          name: 'setting'
        }
      ]
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
