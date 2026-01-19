import Main from '@/views/Main.vue';
import { createRouter, createWebHistory } from 'vue-router';
import ProductionRoutes1 from './productions1.js';
import ProductionRoutes2 from './productions2.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'main',
      component: Main,
      children: [
        {
          path: '/test',
          name: 'test',
          component: () => import('@/views/test.vue')
        },
        ...ProductionRoutes1,
        ...ProductionRoutes2
      ]
    }
  ]
});

export default router;
