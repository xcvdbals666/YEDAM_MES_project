import Main from '@/views/Main.vue';
import { createRouter, createWebHistory } from 'vue-router';
import qualityRouter1 from './quality1.js'; // 품질
import ProductionRoutes1 from './productions1.js';
import ProductionRoutes2 from './productions2.js';
import Material1Routes1 from './material1.js';

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
        ...ProductionRoutes2,
        ...qualityRouter1,
        ...Material1Routes1
      ]
    }
  ]
});

export default router;
