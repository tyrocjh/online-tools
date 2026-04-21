import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home/index.vue')
  },
  {
    path: '/code-tools',
    name: 'CodeTools',
    component: () => import('../views/CodeTools/index.vue')
  },
  {
    path: '/json-tools',
    name: 'JsonTools',
    component: () => import('../views/JsonTools/index.vue')
  },
  {
    path: '/time-tools',
    name: 'TimeTools',
    component: () => import('../views/TimeTools/index.vue')
  },
  {
    path: '/uuid-tools',
    name: 'UuidTools',
    component: () => import('../views/UuidTools/index.vue')
  },
  {
    path: '/image-tools',
    name: 'ImageTools',
    component: () => import('../views/ImageTools/index.vue')
  },
  {
    path: '/image-crop',
    name: 'ImageCrop',
    component: () => import('../views/ImageTools/Crop.vue')
  },
  {
    path: '/image-watermark',
    name: 'ImageWatermark',
    component: () => import('../views/ImageTools/Watermark.vue')
  },
  {
    path: '/image-grid',
    name: 'ImageGrid',
    component: () => import('../views/ImageTools/Grid.vue')
  },
  {
    path: '/about',
    name: 'About',
    component: () => import('../views/Legal/About.vue')
  },
  {
    path: '/privacy',
    name: 'Privacy',
    component: () => import('../views/Legal/Privacy.vue')
  },
  {
    path: '/terms',
    name: 'Terms',
    component: () => import('../views/Legal/Terms.vue')
  },
  {
    path: '/qrcode',
    name: 'QRCode',
    component: () => import('../views/QRCodeTools/index.vue')
  },
  {
    path: '/ip-tools',
    name: 'IPTools',
    component: () => import('../views/IPTools/index.vue')
  },
  {
    path: '/calendar',
    name: 'Calendar',
    component: () => import('../views/CalendarTools/index.vue')
  },
  {
    path: '/reaction-test',
    name: 'ReactionTest',
    component: () => import('../views/ReactionTest/index.vue')
  },
  {
    path: '/mind-map',
    name: 'MindMap',
    component: () => import('../views/MindMap/index.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router