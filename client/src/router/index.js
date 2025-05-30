// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import TestHistory from '../views/testHistory.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/test-history',
      name: 'test-history',
      component: TestHistory
    },
    // other routes
  ]
})

export default router