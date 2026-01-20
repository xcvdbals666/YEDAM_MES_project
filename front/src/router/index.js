import Main from '@/views/Main.vue';
import { createRouter, createWebHistory } from 'vue-router';
import qualityRouter1 from './quality1.js'; // 품질
import qualityRouter2 from './quality2.js'; // 품질
import ProductionRoutes1 from './productions1.js';
import ProductionRoutes2 from './productions2.js';
import Material1Routes1 from './material1.js';
import materialRoutes2 from './material2.js'; // 자재
import OrderRoutes1 from './order1.js'; //주문
import Order2 from './order2.js';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/test',
      name: 'test',
      component: () => import('@/views/test.vue')
    },
    ...ProductionRoutes1,
    ...ProductionRoutes2,
    ...qualityRouter1,
    ...Material1Routes1,
    ...qualityRouter2,
    ...materialRoutes2,
    ...Order2,
    ...OrderRoutes1
  ]
});

export default router;
